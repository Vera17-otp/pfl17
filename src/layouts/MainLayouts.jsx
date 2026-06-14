import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import ChatPanel from "../components/ChatPanel";
import { ChatProvider, useChat } from "../context/ChatContext";
import { TaskProvider } from "../context/TaskContext";

// Inner layout yang bisa mengakses ChatContext
function InnerLayout() {
    const { addSystemNotif } = useChat();
    return (
        <TaskProvider addSystemNotif={addSystemNotif}>
            <div className="hotelify-layout">
                <Sidebar />
                
                <div className="hotelify-main">
                    <Header />
                    
                    <main className="hotelify-content">
                        <PageHeader />
                        
                        <div style={{ marginTop: '24px' }}>
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>

            {/* Panel komunikasi internal — overlay global */}
            <ChatPanel />
        </TaskProvider>
    );
}

export default function MainLayouts() {
    return (
        <ChatProvider>
            <InnerLayout />
        </ChatProvider>
    );
}