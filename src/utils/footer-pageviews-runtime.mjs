const COUNTER_URL = "https://busuanzi.ibruce.info/busuanzi";

export function canTrackPageviews(
	enabled,
	production,
	hostname,
	canonicalHost,
	pathname = "/",
) {
	return (
		enabled &&
		production &&
		canonicalHost === "eitan.chronoresearch.org" &&
		hostname === canonicalHost &&
		!pathname.startsWith("/preview/")
	);
}

/** A new pathname/query counts once; initial Swup events and anchors do not. */
export function createPageviewGate() {
	let lastRoute;
	return (href) => {
		const url = new URL(href);
		const route = url.origin + url.pathname + url.search;
		if (route === lastRoute) return false;
		lastRoute = route;
		return true;
	};
}

export function pageviewText(count) {
	return typeof count === "number" && Number.isSafeInteger(count) && count >= 0
		? String(count)
		: "—";
}

export function startFooterPageviews() {
	const root = document.querySelector("footer-page-views");
	if (
		!root ||
		root.dataset.bound ||
		!canTrackPageviews(
			true,
			root.dataset.production === "true",
			location.hostname,
			root.dataset.hostname,
			location.pathname,
		)
	)
		return;
	root.dataset.bound = "true";
	const value = root.querySelector("#busuanzi_value_site_pv");
	if (!value) return;
	const claimRoute = createPageviewGate();
	let sequence = Promise.resolve();

	function track() {
		value.textContent = "—";
		root.dataset.state = "loading";
		return new Promise((resolve) => {
			const callbackName = `EitanBusuanzi_${Math.random().toString(36).slice(2)}`;
			const script = document.createElement("script");
			let settled = false;
			const finish = (state) => {
				if (settled) return;
				settled = true;
				clearTimeout(timer);
				script.onerror = null;
				script.remove();
				delete window[callbackName];
				root.dataset.state = state;
				if (state !== "ready") value.textContent = "—";
				resolve();
			};
			const timer = setTimeout(() => finish("timeout"), 24_000);
			window[callbackName] = (data) => {
				if (settled) return;
				const text = pageviewText(data?.site_pv);
				if (text === "—") {
					finish("error");
					return;
				}
				value.textContent = text;
				finish("ready");
			};
			script.src = `${COUNTER_URL}?jsonpCallback=${callbackName}`;
			script.async = true;
			script.referrerPolicy = "no-referrer-when-downgrade";
			script.onerror = () => finish("error");
			document.head.appendChild(script);
		});
	}

	const pageView = () => {
		if (!claimRoute(location.href)) return;
		sequence = sequence.then(track).catch(() => {
			value.textContent = "—";
			root.dataset.state = "error";
		});
	};
	let bound = false;
	const bindSwup = () => {
		if (bound || !window.swup?.hooks) return;
		bound = true;
		window.swup.hooks.on("page:view", pageView);
	};
	pageView();
	bindSwup();
	if (!bound)
		document.addEventListener("swup:enable", bindSwup, { once: true });
}
