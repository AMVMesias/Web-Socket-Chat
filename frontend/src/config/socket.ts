const getDevSocketUrl = () => {
	if (typeof window === 'undefined') return 'http://127.0.0.1:5000';

	const hostname = window.location.hostname || '127.0.0.1';
	return `http://${hostname}:5000`;
};

export const socketUrl = import.meta.env.DEV ? getDevSocketUrl() : window.location.origin;
