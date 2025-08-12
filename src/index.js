// Library entry point - exports the main components for use as a library
import App from './components/app';
import Container from './components/container';

// Export the main components that consumers of the library might want to use
export { App, Container };

// Also export Container as the default export for compatibility
export default Container;
