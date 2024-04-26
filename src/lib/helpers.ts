import { Chat, User } from "@/lib/my-types";

export function formatTimestamp(timestamp: Date) {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

export function getInitials(name: string | undefined) {
    if (!name) return "";
    return name
        .split(" ")
        .map((n) => n[0])
        .join("");
}

export function getDMMember(chat: Chat | null, userId: string): string | null {
    if (!chat) return null;
    // Check if chat.userIds is defined and is an array
    if (Array.isArray(chat.userIds)) {
        // If it is, proceed with finding the user ID
        const memberId = chat.userIds.find((memberId) => memberId !== userId);
        // Return the memberId if found, otherwise return null
        return memberId || null;
    } else {
        // If not, handle the situation (e.g., return null)
        return null;
    }
}
