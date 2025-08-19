import { useState } from 'react';
import { MenuState } from '../types';

export const useMenuState = () => {
  const [menuState, setMenuState] = useState<MenuState>({
    showMoveMenu: false,
    menuPosition: { x: 0, y: 0 },
  });

  const showMenu = (x: number, y: number) => {
    setMenuState({
      showMoveMenu: true,
      menuPosition: { x, y },
    });
  };

  const hideMenu = () => {
    setMenuState(prev => ({
      ...prev,
      showMoveMenu: false,
    }));
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    showMenu(e.clientX, e.clientY);
  };

  return {
    menuState,
    showMenu,
    hideMenu,
    handleContextMenu,
  };
};