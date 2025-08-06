import React from 'react';
import { useSidebarLogic } from '../../hooks/useSidebarLogic';
import SidebarUI from './SidebarUI';

const Sidebar = (props) => {
  const sidebarLogic = useSidebarLogic(props);
  
  return <SidebarUI {...props} {...sidebarLogic} />;
};

export default Sidebar;
