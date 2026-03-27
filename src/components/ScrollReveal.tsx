import { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
    children: React.ReactNode;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
}

export default function ScrollReveal({ children, delay = 0, direction = 'up' }: ScrollRevealProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // Uma vez visível, não precisa mais observar
                    if (ref.current) {
                        observer.unobserve(ref.current);
                    }
                }
            },
            {
                threshold: 0.1, // Ativa quando 10% do elemento está visível
                rootMargin: '0px 0px -50px 0px' // Ativa um pouco antes de aparecer
            }
        );

        const node = ref.current;
        if (node) {
            observer.observe(node);
        }

        return () => {
            if (node) {
                observer.unobserve(node);
            }
        };
    }, []);

    // Definir direção da animação
    const getTransform = () => {
        if (isVisible) return 'translate(0, 0)';

        switch (direction) {
            case 'up':
                return 'translate(0, 50px)';
            case 'down':
                return 'translate(0, -50px)';
            case 'left':
                return 'translate(50px, 0)';
            case 'right':
                return 'translate(-50px, 0)';
            default:
                return 'translate(0, 50px)';
        }
    };

    return (
        <div
            ref={ref}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: getTransform(),
                transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}
