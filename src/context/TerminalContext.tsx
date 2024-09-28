import { createContext, useState } from "react";

import { helpArt } from "../assets/asciiArt";
import {
  CommandActions,
  History,
  TerminalCommand,
  TerminalCommandHelp,
  TerminalContextType,
  TerminalOutputType,
} from "../types/terminal";

export const TerminalContext = createContext<TerminalContextType | undefined>(undefined);

export const TerminalProvider = <T extends string>(props: {
  children: React.ReactNode;
  commandActions: CommandActions<T>;
  username: string;
  hostname: string;
  command?: string;
  helpCommand?: TerminalCommandHelp[];
  history?: History[];
}) => {
  const {
    children,
    commandActions,
    username: initialUsername,
    hostname: initialHostname,
    command: initialCommand,
    history: initialHistory,
    helpCommand,
  } = props;
  const [username, setUsername] = useState<string>(initialUsername);
  const [hostname, setHostname] = useState<string>(initialHostname);
  const [command, setCommand] = useState<string>(initialCommand || "");
  const [history, setHistory] = useState<History[]>(initialHistory || []);

  const handleCommand = (newCommand: string) => {
    let historyEntry: History = {
      command: newCommand,
      output: `Command changed to: ${newCommand}`,
      type: TerminalOutputType.INFO,
    };

    if (newCommand === TerminalCommand.CLEAR) {
      setHistory([]);
      return;
    }

    if (newCommand.startsWith(TerminalCommand.SET_USERNAME)) {
      const username = newCommand.split(" ")[2];

      if (!username) {
        historyEntry = {
          command: newCommand,
          output: "Username not provided",
          type: TerminalOutputType.ERROR,
        };
        setHistory((prev) => [...prev, historyEntry]);
        return;
      }

      if (newCommand.split(" ").length > 3) {
        historyEntry = {
          command: newCommand,
          output: "Invalid command",
          type: TerminalOutputType.ERROR,
        };
        setHistory((prev) => [...prev, historyEntry]);
        return;
      }

      setUsername(username);
      return;
    }

    if (newCommand.startsWith(TerminalCommand.SET_HOSTNAME)) {
      const hostname = newCommand.split(" ")[2];

      if (!hostname) {
        historyEntry = {
          command: newCommand,
          output: "Hostname not provided",
          type: TerminalOutputType.ERROR,
        };
        setHistory((prev) => [...prev, historyEntry]);
        return;
      }

      if (newCommand.split(" ").length > 3) {
        historyEntry = {
          command: newCommand,
          output: "Invalid command",
          type: TerminalOutputType.ERROR,
        };
        setHistory((prev) => [...prev, historyEntry]);
        return;
      }

      setHostname(hostname);
      return;
    }

    if (newCommand === TerminalCommand.HELP) {
      const formatCommands = (commands: TerminalCommandHelp[]) =>
        commands
          .map(
            ({ command, description }) =>
              `<span class="text-blue-300">${command}</span> - <span class="text-[#B89076]">${description}</span>`
          )
          .join("\n\n");

      const historyEntry = {
        command: newCommand,
        output:
          helpArt +
          "\n\n" +
          "\nAvailable commands\n\n" +
          formatCommands(Object.values(TerminalCommandHelp)) +
          "\n\n" +
          (helpCommand ? formatCommands(helpCommand) : ""),
        type: TerminalOutputType.INFO,
      };
      setHistory((prev) => [...prev, historyEntry]);
      return;
    }

    // Execute the action if it exists
    if (commandActions[newCommand]) {
      historyEntry = commandActions[newCommand](newCommand.split(" ") as T[]);
    } else {
      historyEntry = {
        command: newCommand,
        output: `Unknown command: ${newCommand}. For a list of commands, type <span class="text-blue-300">"help"</span></span>`,
        type: TerminalOutputType.ERROR,
      };
    }

    setHistory((prev) => [...prev, historyEntry]);
    setCommand(newCommand);
  };

  return (
    <TerminalContext.Provider
      value={{
        command,
        history,
        username,
        hostname,
        handleCommand,
      }}
    >
      {children}
    </TerminalContext.Provider>
  );
};
