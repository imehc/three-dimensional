import { useEffect, useState } from "react";
import { useSafeId } from "~/hooks";

// import hook from "./assets/勾.svg";

interface Props
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "label"
  > {
  label?: string;
  /**
   * 文字左边圆圈的颜色,labelColor不为空生效
   */
  labelColor?: string;
  /**
   * 是否需要边框包裹
   */
  wrap?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * className
   */
  wrapClassName?: string;
}

export const CheckBox: React.FC<Props> = ({
  label,
  labelColor,
  checked,
  onChange,
  disabled,
  wrap = false,
  wrapClassName = "",
  ...attr
}) => {
  const id = useSafeId();
  // 注意：此处使用 useEffect 同步 props 到 state 是为了保持原有逻辑，
  // 但在严格的 React 模式下，建议直接使用 props 控制样式，或使用 defaultValue。
  // 为了保持重构行为一致，此处未修改逻辑。
  const [check, setCheck] = useState<boolean>(!!checked);

  useEffect(() => {
    setCheck(!!checked);
  }, [checked]);

  return (
    <div
      key={`${id}wrap`}
      className={`
        h-10 w-fit inline-flex select-none items-center justify-start overflow-hidden
        border rounded-lg border-solid px-[0.875rem]
        transition duration-200
        ${wrap ? (check ? "border-[#5C68EF]" : "border-[#DCDEEA]") : "border-transparent"}
        ${wrapClassName}
      `}
    >
      <label
        htmlFor={id}
        className={`
          inline-block w-4 h-4 rounded transition-colors
          ${check ? "bg-[#006EFF]" : "bg-[#DCDEEA]"}
          ${disabled ? "cursor-no-drop" : "cursor-pointer"}
          ${label ? "mr-2.5" : ""}
          flex items-center justify-center
        `}
      >
        {/* 如果需要显示勾选图标，可以在此处添加 SVG，根据 check 状态控制显示 */}
        <input
          {...attr}
          checked={checked}
          disabled={disabled}
          type="checkbox"
          id={id}
          className="hidden"
          onChange={(e) => {
            setCheck(e.target.checked);
            onChange?.(e);
          }}
        />
      </label>

      <label htmlFor={id} className="flex items-center">
        {!!labelColor && label && (
          <span
            className="inline-block w-[0.625rem] h-[0.625rem] rounded-full mr-[0.3125rem]"
            style={{ backgroundColor: labelColor }}
          ></span>
        )}
        <span
          className={`
            text-sm transition-colors
            ${check ? "text-[#5C68EF]" : "text-[#787C82]"}
            ${disabled ? "cursor-no-drop" : "cursor-pointer"}
          `}
        >
          {label}
        </span>
      </label>
    </div>
  );
};