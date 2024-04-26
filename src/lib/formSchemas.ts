import { z } from "zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const messageFormSchema = z.object({
    message: z.string(),
});

export type MessageFormValues = z.infer<typeof messageFormSchema>;

export const useMessageForm = () => {
    return useForm<MessageFormValues>({
        resolver: zodResolver(messageFormSchema),
        defaultValues: {
            message: "",
        },
    });
};
