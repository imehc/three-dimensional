import { Sandpack, type SandpackProps } from "@codesandbox/sandpack-react";
import { githubLight } from "@codesandbox/sandpack-themes";

export default function Playground(props: SandpackProps) {
	return (
		<Sandpack
			template="vite-react-ts"
			theme={githubLight}
			{...props}
			options={{
				showConsole: true,
				showLineNumbers: true,
				showConsoleButton: true,
				showNavigator: true,
				showInlineErrors: true,
				// showRefreshButton: true,
				closableTabs: true,
				showTabs: true,
				editorHeight: 500,
				...props.options,
			}}
		/>
	);
}
