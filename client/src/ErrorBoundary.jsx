import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[sms] render error:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const msg = this.state.error && this.state.error.message ? this.state.error.message : String(this.state.error);
    return (
      <div style={{ padding: 40, maxWidth: 760, margin: '0 auto', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', letterSpacing: '0.06em' }}>حدث خطأ / An error occurred</h1>
        <pre style={{ background: 'var(--surface-2)', padding: 16, fontSize: '0.82rem', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
          {msg}
        </pre>
        <p style={{ color: 'var(--ink-2)' }}>
          أعد تحميل الصفحة للمحاولة مجددًا. — Please reload to try again.
        </p>
      </div>
    );
  }
}