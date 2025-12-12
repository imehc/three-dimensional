import clsx from "clsx";
import { type CSSProperties, type FC, useEffect, useState } from "react";

interface Props {
	backGround?: string;
	activeBackGround?: string;
	activeText?: string;
	inactiveText?: string;
	disabled?: boolean;
	size?: "large" | "default" | "small";
	width?: number;
	onChange?: (result: boolean) => void;
	checked?: boolean;
	className?: string;
	style?: CSSProperties;
}

// 尺寸映射配置，替代原有的 switch case
const containerSizeClasses = {
	small: "h-[15px] rounded-[15px]",
	default: "h-[20px] rounded-[20px]",
	large: "h-[25px] rounded-[25px]",
};

const circleSizeClasses = {
	small: "w-[9px] h-[9px]",
	default: "w-[14px] h-[14px]",
	large: "w-[19px] h-[19px]",
};

export const CustomSwitch: FC<Props> = ({
	activeBackGround = "linear-gradient(to bottom right,#6F88FF,#4C4DE2)",
	backGround = "#9A9FA5",
	activeText = "ON",
	inactiveText = "OFF",
	disabled = false,
	size = "default",
	width = 50,
	onChange,
	checked: defaultChecked = false,
	className = "",
	style,
}): JSX.Element => {
	const [checked, setChecked] = useState(defaultChecked);

	// 可选：如果外部 checked 改变，同步内部状态 (建议添加此逻辑以支持受控模式，保持原逻辑可忽略)
	useEffect(() => {
		setChecked(defaultChecked);
	}, [defaultChecked]);

	return (
		<div
			className={clsx(
				"relative inline-block overflow-hidden transition-colors duration-200", // 基础样式
				containerSizeClasses[size], // 尺寸样式
				disabled ? "grayscale cursor-not-allowed" : "cursor-pointer", // 交互样式
				className,
			)}
			style={{
				width, // 宽度是数值，直接透传
				background: checked ? activeBackGround : backGround, // 颜色可能是渐变，使用 style
				...style,
			}}
			onClick={() => {
				if (disabled || !onChange) {
					return;
				}
				setChecked(!checked);
				onChange(!checked);
			}}
		>
			<div
				className={clsx(
					"absolute top-[3px] bg-white rounded-full transition-all duration-200", // 基础样式
					circleSizeClasses[size], // 圆点尺寸
					checked ? "right-[3px]" : "left-[3px]", // 位置切换
				)}
			>
				{/* 文字元素保持原有绝对定位逻辑 */}
				<span className="z-1 absolute top-[50%] translate-y-[-50%] right-5 text-[10px] text-white select-none">
					{activeText}
				</span>
				<span className="z-1 absolute top-[50%] translate-y-[-50%] left-4 text-[10px] text-white select-none">
					{inactiveText}
				</span>
			</div>
		</div>
	);
};
