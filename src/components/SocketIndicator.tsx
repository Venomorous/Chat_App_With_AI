type SocketIndicatorProps = {
    isConnected: boolean;
};

export default function SocketIndicator({ isConnected }: SocketIndicatorProps) {
    if (!isConnected) return <div>Offline</div>;

    return <div>Online</div>;
}
