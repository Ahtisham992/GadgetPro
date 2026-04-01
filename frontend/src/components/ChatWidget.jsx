import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Minus, Send, Bot, User, ShoppingCart } from 'lucide-react';
import useCartStore from '../store/cartStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! I am the GadgetPro AI assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const cartItems = useCartStore((s) => s.cartItems);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // Only send actual string content to the backend
                    messages: newMessages.map(m => ({ role: m.role, content: m.content })),
                    cartContext: cartItems.map(item => ({ name: item.name, qty: item.qty }))
                })
            });

            if (!response.ok) throw new Error('API Error');

            const data = await response.json();
            
            // Intercept and parse AI Action Tags before rendering
            let parsedContent = data.content || "";
            const actionRegex = /\[ACTION:ADD_CART_([a-zA-Z0-9_-]+)(?:_(\d+))?\]/g;
            const removeActionRegex = /\[ACTION:REMOVE_CART_([a-zA-Z0-9_-]+)\]/g;
            let match;
            let addedCount = 0;
            let removedCount = 0;

            // Handle Add to Cart
            while ((match = actionRegex.exec(parsedContent)) !== null) {
                const productId = match[1];
                const qty = match[2] ? parseInt(match[2], 10) : 1;
                try {
                    const prodRes = await fetch(`/api/products/${productId}`);
                    if (prodRes.ok) {
                        const prodData = await prodRes.json();
                        useCartStore.getState().addToCart(prodData, qty);
                        addedCount += qty;
                    }
                } catch (e) { console.error("Auto-Cart action failed: ", e); }
            }

            // Handle Remove from Cart
            while ((match = removeActionRegex.exec(parsedContent)) !== null) {
                const productId = match[1];
                useCartStore.getState().removeFromCart(productId);
                removedCount++;
            }

            // Clean up text and add confirmations
            parsedContent = parsedContent.replace(actionRegex, '');
            parsedContent = parsedContent.replace(removeActionRegex, '');
            
            if (addedCount > 0) {
                parsedContent += `\n\n> ✅ **Successfully added ${addedCount} item(s) to your cart!**`;
            }
            if (removedCount > 0) {
                parsedContent += `\n\n> 🗑️ **Successfully removed ${removedCount} item(s) from your cart!**`;
            }

            setMessages(prev => [...prev, { ...data, content: parsedContent }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting to the server right now. Please try again later.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
            {/* Chat Bubble */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: '60px', height: '60px',
                        borderRadius: '30px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 8px 32px rgba(249,115,22,0.4)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <MessageCircle size={30} />
                </button>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div style={{
                    width: '380px', height: '600px',
                    maxHeight: '80vh', maxWidth: 'calc(100vw - 2rem)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '24px',
                    boxShadow: 'var(--shadow-xl)',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                }}>
                    {/* Header */}
                    <div style={{ 
                        padding: '1.25rem', 
                        background: 'var(--color-bg-alt)', 
                        borderBottom: '1px solid var(--color-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                <Bot size={20} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>GadgetPro AI</h3>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)' }} />
                                    Online
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                                onClick={() => setIsOpen(false)}
                                title="Minimize"
                                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-border)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <Minus size={20} />
                            </button>
                            <button 
                                onClick={() => { setIsOpen(false); setMessages([{ role: 'assistant', content: 'Hi! I am the GadgetPro AI assistant. How can I help you today?' }]); }}
                                title="Close & Clear Chat"
                                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-border)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--color-surface)' }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{ 
                                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                display: 'flex', gap: '0.5rem',
                                flexDirection: m.role === 'user' ? 'row-reverse' : 'row'
                            }}>
                                <div style={{ 
                                    width: '28px', height: '28px', flexShrink: 0,
                                    borderRadius: '8px', 
                                    background: m.role === 'user' ? 'var(--color-border)' : 'var(--color-primary-light)',
                                    color: m.role === 'user' ? 'var(--color-text-muted)' : 'var(--color-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>
                                <div style={{ 
                                    background: m.role === 'user' ? 'var(--color-primary)' : 'var(--color-bg-alt)',
                                    color: m.role === 'user' ? '#fff' : 'var(--color-text)',
                                    padding: '0.875rem',
                                    borderRadius: '16px',
                                    borderTopRightRadius: m.role === 'user' ? '4px' : '16px',
                                    borderTopLeftRadius: m.role === 'assistant' ? '4px' : '16px',
                                    fontSize: '0.875rem',
                                    lineHeight: 1.5,
                                    boxShadow: 'var(--shadow-sm)',
                                    whiteSpace: 'normal', // Allow markdown renderer to handle spacing
                                    overflowWrap: 'anywhere'
                                }}>
                                    <ReactMarkdown 
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            p: ({node, ...props}) => <p style={{ margin: '0 0 0.75rem 0', '&:last-child': { margin: 0 } }} {...props} />,
                                            a: ({node, href, children, ...props}) => {
                                                // Intelligent Routing: Internal links use SPA React Router, external use standard anchor
                                                if (href && href.startsWith('/')) {
                                                    return <Link to={href} style={{ color: m.role === 'user' ? '#fff' : 'var(--color-primary)', textDecoration: 'underline', fontWeight: 600 }}>{children}</Link>
                                                }
                                                return <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: m.role === 'user' ? '#fff' : 'var(--color-primary)', textDecoration: 'underline' }} {...props}>{children}</a>
                                            },
                                            ul: ({node, ...props}) => <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0' }} {...props} />,
                                            li: ({node, ...props}) => <li style={{ marginBottom: '0.25rem' }} {...props} />,
                                            strong: ({node, ...props}) => <strong style={{ fontWeight: 700 }} {...props} />,
                                            blockquote: ({node, ...props}) => <blockquote style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: '1rem', margin: '0.5rem 0', opacity: 0.9, background: 'var(--color-surface)', borderRadius: '4px' }} {...props} />
                                        }}
                                    >
                                        {m.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.5rem' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={14} /></div>
                                <div style={{ background: 'var(--color-bg-alt)', padding: '0.875rem', borderRadius: '16px', borderTopLeftRadius: '4px', fontSize: '0.875rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ animation: 'bounce 1s infinite' }}>.</span>
                                    <span style={{ animation: 'bounce 1s infinite 0.2s' }}>.</span>
                                    <span style={{ animation: 'bounce 1s infinite 0.4s' }}>.</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-alt)' }}>
                        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about products, specs, deals..."
                                style={{
                                    flex: 1,
                                    padding: '0.875rem 1rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-surface)',
                                    color: 'var(--color-text)',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                    fontFamily: 'inherit',
                                    transition: 'border-color 0.15s'
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                style={{
                                    width: '46px', height: '46px', flexShrink: 0,
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: input.trim() ? 'var(--color-primary)' : 'var(--color-border)',
                                    color: input.trim() ? '#fff' : 'var(--color-text-muted)',
                                    cursor: input.trim() ? 'pointer' : 'not-allowed',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'background 0.2s',
                                }}
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
