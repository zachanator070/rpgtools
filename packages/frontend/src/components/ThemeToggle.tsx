import React from "react";
import { Button } from "antd";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useTheme } from "../ThemeContext";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      icon={theme === "light" ? <MoonOutlined /> : <SunOutlined />}
      onClick={toggleTheme}
      className={className}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    />
  );
};
