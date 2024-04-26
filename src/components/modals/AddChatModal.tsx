"use client";
import { useState, useEffect } from "react";

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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Contact } from "@/lib/my-types";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/helpers";

import { BiSolidMessageAdd } from "react-icons/bi";

type AddChatModalProps = {
    onAddChat: (selectedContacts: Contact[]) => void;
    getContacts: () => Promise<Contact[]>;
};

const ContactSchema = z.object({
    id: z.string(),
    username: z.string(),
    name: z.string(),
    imageUrl: z.string(),
});

const FormSchema = z.object({
    contacts: z.array(ContactSchema).refine((value) => value.length > 0, {
        message: "You have to select at least one item.",
    }),
});

export default function AddChatModal({
    onAddChat,
    getContacts,
}: AddChatModalProps) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            contacts: [],
        },
    });

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        await onAddChat(data.contacts);
        form.reset();
        setOpen(false);
    };

    useEffect(() => {
        getContacts().then((contacts: Contact[]) => {
            setContacts(contacts);
        });
    }, []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="size-full text-center hover:bg-secondary-300 flex items-center justify-center">
                    <BiSolidMessageAdd />
                    <span className="ml-2">Add Chat</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="grid gap-4 py-4"
                    >
                        <DialogHeader className="text-slate-200">
                            <DialogTitle>Creating chat</DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Select the contacts you want to add to the chat
                            </DialogDescription>
                        </DialogHeader>
                        <FormField
                            control={form.control}
                            name="contacts"
                            render={() => (
                                <FormItem>
                                    {contacts.map((contact) => (
                                        <FormField
                                            key={contact.id}
                                            control={form.control}
                                            name="contacts"
                                            render={({ field }) => {
                                                return (
                                                    <FormItem
                                                        key={contact.id}
                                                        className="flex flex-row items-start space-x-3 space-y-0"
                                                    >
                                                        <FormControl>
                                                            <Label className="flex items-center space-x-4 cursor-pointer">
                                                                <Checkbox
                                                                    checked={field.value?.some(
                                                                        (c) =>
                                                                            c.id ===
                                                                            contact.id
                                                                    )}
                                                                    onCheckedChange={(
                                                                        checked
                                                                    ) => {
                                                                        if (
                                                                            checked
                                                                        ) {
                                                                            // Add the contact to the array if not already present
                                                                            const existingContact =
                                                                                field.value?.find(
                                                                                    (
                                                                                        c
                                                                                    ) =>
                                                                                        c.id ===
                                                                                        contact.id
                                                                                );
                                                                            if (
                                                                                !existingContact
                                                                            ) {
                                                                                field.onChange(
                                                                                    [
                                                                                        ...field.value,
                                                                                        contact,
                                                                                    ]
                                                                                );
                                                                            }
                                                                        } else {
                                                                            // Remove the contact from the array
                                                                            field.onChange(
                                                                                field.value?.filter(
                                                                                    (
                                                                                        c
                                                                                    ) =>
                                                                                        c.id !==
                                                                                        contact.id
                                                                                )
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                                <div className="flex items-center space-x-4">
                                                                    <Avatar>
                                                                        <AvatarImage
                                                                            src={
                                                                                contact?.imageUrl
                                                                            }
                                                                        />
                                                                        <AvatarFallback>
                                                                            {getInitials(
                                                                                contact.name
                                                                            )}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex flex-col">
                                                                        <h3 className="text-lg font-semibold text-gray-100">
                                                                            {
                                                                                contact.name
                                                                            }
                                                                        </h3>
                                                                        <p className="text-sm text-gray-300">
                                                                            {
                                                                                contact.username
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </Label>
                                                        </FormControl>
                                                    </FormItem>
                                                );
                                            }}
                                        />
                                    ))}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="hover:bg-secondary-400"
                        >
                            Add Chat
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
