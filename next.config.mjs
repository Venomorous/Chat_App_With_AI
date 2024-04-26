/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "xsgames.co",
            },
            {
                protocol: "https",
                hostname: "cdn.discordapp.com",
            },
        ],
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals = [...config.externals, "socket.io-client"];
        }
        return config;
    },
};

export default nextConfig;
