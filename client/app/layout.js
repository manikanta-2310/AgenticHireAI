import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'AgenticHire.AI | Spec-Driven Multi-Agent Recruitment Platform',
  description: 'Enterprise recruitment ecosystem powered by LangGraph AI agents, RAG intelligence, and spec-driven workflow orchestration.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
        <Navbar />
        <main className="min-h-[calc(100vh-65px)]">
          {children}
        </main>
      </body>
    </html>
  );
}
