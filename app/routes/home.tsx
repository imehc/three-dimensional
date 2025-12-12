import { useEffect } from "react";
import { useNavigate } from "react-router";
import menus from "../menus";

export default function Home() {
	const navigate = useNavigate();

	useEffect(() => {
		const items = menus.flatMap((item) => item.items);
		if (items.length > 0) {
			navigate(items[items.length - 1].href, { replace: true });
		}
	}, [navigate]);

	return null;
}
