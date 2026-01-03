export default function PlayerLayout(props: LayoutProps<"/player/[username]">) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {props.children}
    </div>
  );
}
