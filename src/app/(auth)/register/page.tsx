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
import axios from "axios";

const formSchema = z
    .object({
        username: z.string().refine(
            (value) => {
                const nonSpaceChars = value.replace(/\s/g, "").length;
                return nonSpaceChars >= 2;
            },
            {
                message:
                    "Username must contain at least 2 non-space characters",
            }
        ),
        name: z.string().refine(
            (value) => {
                const nonSpaceChars = value.replace(/\s/g, "").length;
                return nonSpaceChars >= 2;
            },
            {
                message: "Name must be at least 2 non-space characters",
            }
        ),
        email: z.string().email(),
        password: z.string().min(6, {
            message: "Password must be at least 6 characters long",
        }),
        passwordConfirm: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirm, {
        message: "Passwords do not match",
        path: ["passwordConfirm"],
    });

export default function Login() {
    const [loading, setLoading] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            passwordConfirm: "",
            name: "",
        },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const result = await axios.post("/api/auth/register", data);
            if (result.data.error) {
                console.error("Registration failed:", result.data.error);
                alert(result.data.error);
            } else {
                await signIn("credentials", {
                    email: data.email,
                    password: data.password,
                    callbackUrl: "/chats",
                });
            }
        } catch (error) {
            console.error("Error during registration:", error);
            alert(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="h-screen flex items-center justify-center overflow-hidden">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5 w-[500px] bg-secondary-400 p-8 rounded-xl shadow-lg"
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
                                        placeholder="Username"
                                        {...field}
                                    />
                                </FormControl>

                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-100">
                                    Name
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        className="bg-secondary text-gray-100"
                                        placeholder="John Doe"
                                        {...field}
                                    />
                                </FormControl>

                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
                                        placeholder="example@email.com"
                                        type="email"
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
                    <FormField
                        control={form.control}
                        name="passwordConfirm"
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
                        Register
                    </Button>
                </form>
            </Form>
        </main>
    );
}
