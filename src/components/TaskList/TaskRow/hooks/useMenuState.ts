import { useState } from 'react';
import { MenuState } from '../types';

export const useMenuState = () => {
  const [menuState, setMenuState] = useState<MenuState>({
    showMoveMenu: false,
    showContextMenu: false,
    menuPosition: { x: 0, y: 0 },
  });

  const showMenu = (x: number, y: number) => {
    setMenuState({
      showMoveMenu: true,
      showContextMenu: false,
      menuPosition: { x, y },
    });
  };

  const showContextMenu = (x: number, y: number) => {
    setMenuState({
      showMoveMenu: false,
      showContextMenu: true,
      menuPosition: { x, y },
    });
  };

  const hideMenu = () => {
    setMenuState(prev => ({
      ...prev,
      showMoveMenu: false,
      showContextMenu: false,
    }));
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e.clientX, e.clientY);
  };

  return {
    menuState,
    showMenu,
    showContextMenu,
    hideMenu,
    handleContextMenu,
  };
};