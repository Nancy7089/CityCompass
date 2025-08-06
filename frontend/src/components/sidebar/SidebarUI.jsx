import React from 'react';
import SidebarHeader from './components/SidebarHeader';
import NewChatButton from './components/NewChatButton';
import RecentChatsList from './RecentChatsList'; // Use existing
import NavigationItems from './NavigationItems'; // Use existing
import SidebarFooter from './components/SidebarFooter';
import { sidebarStyles } from './styles/sidebarStyles';

const SidebarUI = ({ isCollapsed, setIsCollapsed, /* other props */ }) => (
  <aside className={`cc-sidebar ${isCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`} 
         style={sidebarStyles.container}>
    <SidebarHeader isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(v => !v)} />
    <NewChatButton isCollapsed={isCollapsed} onClick={handleNewChat} />
    <RecentChatsList /* props */ />
    <NavigationItems /* props */ />
    <SidebarFooter /* props */ />
  </aside>
);

export default SidebarUI;
