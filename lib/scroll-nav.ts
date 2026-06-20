export function getStickyNavOffsetPx(): number {
  const styles = getComputedStyle(document.documentElement);
  const toolbar = parseFloat(styles.getPropertyValue("--toolbar-height"));
  const tabs = parseFloat(styles.getPropertyValue("--category-tabs-height"));
  return (
    (Number.isFinite(toolbar) ? toolbar : 56) +
    (Number.isFinite(tabs) ? tabs : 48)
  );
}

export function scrollElementBelowStickyNav(
  element: HTMLElement,
  behavior: ScrollBehavior = "smooth"
) {
  const top =
    element.getBoundingClientRect().top +
    window.scrollY -
    getStickyNavOffsetPx();
  window.scrollTo({ top, behavior });
}

export function scrollTabToHorizontalCenter(
  container: HTMLElement,
  tab: HTMLElement,
  behavior: ScrollBehavior = "smooth"
) {
  const tabRect = tab.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const tabCenter = tabRect.left + tabRect.width / 2;
  const containerCenter = containerRect.left + containerRect.width / 2;
  container.scrollBy({ left: tabCenter - containerCenter, behavior });
}
