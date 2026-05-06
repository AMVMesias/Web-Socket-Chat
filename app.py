import os
import time
from uuid import uuid4
from flask import Flask, request, send_from_directory
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS

app = Flask(__name__, static_folder='frontend/dist', static_url_path='/')
app.config['SECRET_KEY'] = 'secret!'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# State management
# rooms = { room_id: { sid: username } }
rooms = {}

# room_configs = { room_id: { capacity, created_by, created_at } }
room_configs = {}

# user_rooms = { sid: room_id }
user_rooms = {}

# active_messages keeps only volatile metadata, never message contents.
# active_messages = {
#   message_id: {
#       room, sender_sid, sender, recipients: set(sid),
#       read_by: { sid: username }, created_at, ttl, expires_at
#   }
# }
active_messages = {}

ALLOWED_TTLS = {10, 60, 300}
MESSAGE_METADATA_MAX_AGE = 60 * 60
ROOM_METADATA_MAX_AGE = 60 * 60
MIN_ROOM_CAPACITY = 2
MAX_ROOM_CAPACITY = 20


def clean_text(value):
    return str(value or '').strip()


def normalize_ttl(value):
    try:
        ttl = int(value)
    except (TypeError, ValueError):
        return None

    return ttl if ttl in ALLOWED_TTLS else None


def normalize_capacity(value):
    try:
        capacity = int(value)
    except (TypeError, ValueError):
        return None

    if capacity < MIN_ROOM_CAPACITY or capacity > MAX_ROOM_CAPACITY:
        return None

    return capacity


def cleanup_empty_room_configs():
    now = time.time()
    for room, config in list(room_configs.items()):
        if room in rooms:
            continue

        created_at = config.get('created_at', now)
        if now - created_at > ROOM_METADATA_MAX_AGE:
            room_configs.pop(room, None)


def room_summary(room):
    config = room_configs.get(room, {})
    capacity = config.get('capacity', MIN_ROOM_CAPACITY)
    current = len(rooms.get(room, {}))

    return {
        'room': room,
        'capacity': capacity,
        'current': current,
        'available': max(capacity - current, 0),
        'full': current >= capacity,
        'created_by': config.get('created_by', 'Anonimo'),
    }


def room_list_payload():
    cleanup_empty_room_configs()
    return [
        room_summary(room)
        for room in sorted(room_configs.keys())
    ]


def broadcast_room_list():
    socketio.emit('room_list', room_list_payload())


def cleanup_active_messages():
    now = time.time()
    for message_id, metadata in list(active_messages.items()):
        expires_at = metadata.get('expires_at')
        created_at = metadata.get('created_at', now)
        room = metadata.get('room')

        if expires_at and expires_at <= now:
            active_messages.pop(message_id, None)
        elif room not in rooms:
            active_messages.pop(message_id, None)
        elif now - created_at > MESSAGE_METADATA_MAX_AGE:
            active_messages.pop(message_id, None)


def remove_room_message_metadata(room):
    for message_id, metadata in list(active_messages.items()):
        if metadata.get('room') == room:
            active_messages.pop(message_id, None)


def remove_sender_message_metadata(sid):
    for message_id, metadata in list(active_messages.items()):
        if metadata.get('sender_sid') == sid:
            active_messages.pop(message_id, None)


def read_receipt_payload(message_id, metadata, reader=None):
    recipients = metadata.get('recipients', set())
    read_by = metadata.get('read_by', {})
    read_names = [read_by[sid] for sid in recipients if sid in read_by]
    read_count = len(read_names)
    recipient_count = len(recipients)

    return {
        'message_id': message_id,
        'reader': reader,
        'readBy': read_names,
        'read_count': read_count,
        'recipient_count': recipient_count,
        'all_read': recipient_count > 0 and read_count == recipient_count,
    }

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

# Catch-all route to serve other static files like CSS/JS
@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')
    emit('room_list', room_list_payload())


@socketio.on('get_rooms')
def handle_get_rooms():
    emit('room_list', room_list_payload())


@socketio.on('create_room')
def handle_create_room(data):
    username = clean_text(data.get('username'))
    room = clean_text(data.get('room'))
    capacity = normalize_capacity(data.get('capacity'))

    if not room:
        return {'ok': False, 'error': 'Escribe un nombre o codigo para la sala.'}

    if len(room) > 32:
        return {'ok': False, 'error': 'El codigo de sala debe tener maximo 32 caracteres.'}

    if capacity is None:
        return {
            'ok': False,
            'error': f'El cupo debe estar entre {MIN_ROOM_CAPACITY} y {MAX_ROOM_CAPACITY} participantes.',
        }

    if room in room_configs:
        return {'ok': False, 'error': 'Ya existe una sala con ese codigo.'}

    room_configs[room] = {
        'capacity': capacity,
        'created_by': username or 'Anfitrion',
        'created_at': time.time(),
    }

    broadcast_room_list()
    return {'ok': True, 'room': room_summary(room)}

@socketio.on('join')
def handle_join(data):
    username = clean_text(data.get('username'))
    room = clean_text(data.get('room'))
    
    if not username or not room:
        emit('join_error', {'message': 'Nombre de usuario y sala son obligatorios.'})
        return

    if room not in room_configs:
        emit('join_error', {'message': 'La sala no existe. Creala primero desde la pantalla principal.'})
        return

    cleanup_active_messages()

    current_users = rooms.get(room, {})
    capacity = room_configs[room]['capacity']
    if len(current_users) >= capacity:
        emit('join_error', {'message': 'La sala ya esta llena.'})
        broadcast_room_list()
        return

    if username in current_users.values():
        emit('join_error', {'message': 'Ese nombre ya esta en uso dentro de la sala.'})
        return
        
    join_room(room)
    
    if room not in rooms:
        rooms[room] = {}
        
    rooms[room][request.sid] = username
    user_rooms[request.sid] = room
    
    print(f'{username} ({request.sid}) joined room {room}')
    
    # Notify room about user list update
    emit('join_result', {'ok': True, 'room': room_summary(room)})
    emit('user_list', list(rooms[room].values()), room=room)
    emit('user_joined', {'username': username}, room=room, include_self=False)
    broadcast_room_list()

@socketio.on('chat_message')
def handle_chat_message(data):
    room = user_rooms.get(request.sid)
    if not room:
        return
        
    username = rooms[room].get(request.sid, 'Unknown')
    message_text = str(data.get('message', '')).strip()
    if not message_text:
        return

    cleanup_active_messages()

    message_id = data.get('id') or uuid4().hex
    ttl = normalize_ttl(data.get('ttl'))
    recipients = {
        sid for sid in rooms.get(room, {})
        if sid != request.sid
    }
    
    # data expects: id, message, ttl
    message_data = {
        'id': message_id,
        'username': username,
        'message': message_text,
        'timestamp': data.get('timestamp'),
        'ttl': ttl, # Time to live in seconds
        'readBy': [],
        'read_count': 0,
        'recipient_count': len(recipients),
        'all_read': False,
    }

    active_messages[message_id] = {
        'room': room,
        'sender_sid': request.sid,
        'sender': username,
        'recipients': recipients,
        'read_by': {},
        'created_at': time.time(),
        'ttl': ttl,
        'expires_at': None,
    }
    
    # We do NOT save the message to any database or file.
    # Broadcast to everyone in the room
    emit('chat_message', message_data, room=room)

@socketio.on('message_read')
def handle_message_read(data):
    room = user_rooms.get(request.sid)
    if not room:
        return

    cleanup_active_messages()
        
    reader = rooms[room].get(request.sid, 'Unknown')
    message_id = data.get('message_id')
    metadata = active_messages.get(message_id)
    if not metadata or metadata.get('room') != room:
        return

    sender_sid = metadata.get('sender_sid')
    if request.sid == sender_sid or request.sid not in metadata.get('recipients', set()):
        return

    metadata['read_by'][request.sid] = reader
    read_data = read_receipt_payload(message_id, metadata, reader)

    if read_data['all_read'] and metadata.get('ttl') and metadata.get('expires_at') is None:
        metadata['expires_at'] = time.time() + metadata['ttl']
        emit(
            'message_expire_started',
            {
                'message_id': message_id,
                'ttl': metadata['ttl'],
                'expires_in': metadata['ttl'],
                'all_read': True,
            },
            room=room,
        )

    # The lab requires forwarding the read receipt only to the original sender.
    emit('message_read', read_data, to=sender_sid)

@socketio.on('disconnect')
def handle_disconnect():
    room = user_rooms.get(request.sid)
    if room:
        username = rooms[room].pop(request.sid, 'Unknown')
        remove_sender_message_metadata(request.sid)
        
        if not rooms[room]:
            remove_room_message_metadata(room)
            del rooms[room]
            broadcast_room_list()
        else:
            emit('user_list', list(rooms[room].values()), room=room)
            emit('user_left', {'username': username}, room=room)
            broadcast_room_list()
            
        del user_rooms[request.sid]
        print(f'Client disconnected: {request.sid} ({username}) from room {room}')
    else:
        print(f'Client disconnected: {request.sid}')

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
