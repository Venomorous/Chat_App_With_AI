"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { IoPersonAddSharp } from "react-icons/io5";

import axios from "axios";

type AddContactModalProps = {
    onAddContact: () => void;
};

const formSchema = z.object({
    username: z.string().refine(
        (value) => {
            const nonSpaceChars = value.replace(/\s/g, "").length;
            return nonSpaceChars >= 2;
        },
        {
            message: "Username must contain at least 2 non-space characters",
        }
    ),
});

export default function AddChatModal({ onAddContact }: AddContactModalProps) {
    const [open, setOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        console.log("Data:", data.username);
        try {
            const res = await axios.post("/api/add-contact", {
                username: data.username,
            });

            await onAddContact();
        } catch (error) {
            console.error("Error adding contact:", error);
            alert("An error occurred while adding contact");
        } finally {
            setOpen(false);
            form.reset();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="size-full text-center hover:bg-secondary-300 flex items-center justify-center">
                    <IoPersonAddSharp />
                    <span className="ml-2">Add Contact</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-100">
                                        Username
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            className="bg-secondary text-gray-100"
                                            placeholder="contact-username"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">
                            Add Contact
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
