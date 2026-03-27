import { useState, useEffect } from 'react';

interface Route {
    path: string;
    component: React.ComponentType;
}

interface RouterProps {
    routes: Route[];
}

export function SimpleRouter({ routes }: RouterProps) {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    useEffect(() => {
        const handleLocationChange = () => {
            setCurrentPath(window.location.pathname);
        };

        window.addEventListener('popstate', handleLocationChange);
        return () => window.removeEventListener('popstate', handleLocationChange);
    }, []);

    const matchedRoute = routes.find(route => route.path === currentPath);
    const Component = matchedRoute?.component || routes[0]?.component;

    return Component ? <Component /> : null;
}

// eslint-disable-next-line react-refresh/only-export-components
export function navigate(path: string) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
}

export function Link({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate(to);
    };

    return (
        <a href={to} onClick={handleClick} className={className}>
            {children}
        </a>
    );
}
