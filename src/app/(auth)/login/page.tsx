"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormField,
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters long",
    }),
});

export default function Login() {
    const [loading, setLoading] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            await signIn("credentials", {
                email: data.email,
                password: data.password,
                callbackUrl: "/chats",
            });
        } catch (error) {
            console.error("Error logging in:", error);
            alert("An error occurred while logging in");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="h-screen flex items-center justify-center overflow-hidden">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8 w-[500px] bg-secondary-400 p-8 rounded-xl shadow-lg"
                >
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-100">
                                    Email
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        className="bg-secondary text-gray-100"
                                        type="email"
                                        placeholder="example@email.com"
                                        {...field}
                                    />
                                </FormControl>

                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-100">
                                    Password
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        className="bg-secondary text-gray-100"
                                        placeholder="Password"
                                        type="password"
                                        {...field}
                                    />
                                </FormControl>

                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="w-full hover:bg-primary-100"
                    >
                        Login
                    </Button>
                </form>
            </Form>
        </main>
    );
}
