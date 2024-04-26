// "use client";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";

// import { Input } from "@/components/ui/input";
// import { Button } from "../ui/button";
// import {
//     Form,
//     FormControl,
//     FormDescription,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from "@/components/ui/form";
// import { IoMdSend } from "react-icons/io";

// const formSchema = z.object({
//     message: z.string(),
// });

// type ChatInputProps = {
//     onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
//     enteredMessage: string;
//     setEnteredMessage: (value: string) => void;
// };

// export default function ChatInput({
//     onSubmit,
//     enteredMessage,
//     setEnteredMessage,
// }: ChatInputProps) {
//     const form = useForm<z.infer<typeof formSchema>>({
//         resolver: zodResolver(formSchema),
//         defaultValues: {
//             message: "",
//         },
//     });

//     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         await onSubmit(e);
//     };

//     return (
//         <Form {...form}>
//             <form
//                 onSubmit={form.handleSubmit(handleSubmit)}
//                 className="w-full flex items-center justify-between"
//             >
//                 <FormField
//                     control={form.control}
//                     name="message"
//                     render={(field) => {
//                         return (
//                             <FormItem>
//                                 <FormControl>
//                                     <Input
//                                         type="text"
//                                         id="message"
//                                         {...field}
//                                         onChange={(e) => {
//                                             field.onChange(e);
//                                             setEnteredMessage(e.target.value);
//                                         }}
//                                         placeholder="Type your message..."
//                                         className="w-full h-3/5 px-3 py-2 bg-primary-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 mr-2 text-white"
//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         );
//                     }}
//                 />
//                 <Button
//                     type="submit"
//                     className="rounded-full px-3 py-1 bg-secondary-300 text-white flex items-center hover:bg-secondary"
//                 >
//                     <span className="px-2">Send</span>
//                     <IoMdSend />
//                 </Button>
//             </form>
//         </Form>
//         // <form
//         //     onSubmit={handleSubmit}
//         //     className=" w-full flex items-center justify-between"
//         // >
//         //     <Input
//         //         className="w-full h-3/5 px-3 py-2 bg-primary-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 mr-2 text-white"
//         //         type="text"
//         //         id="message"
//         //         value={enteredMessage}
//         //         onChange={(e) => setEnteredMessage(e.target.value)}
//         //         placeholder="Type your message..."
//         //     />
//         //     <Button
//         //         type="submit"
//         //         className="rounded-full px-3 py-1 bg-secondary-300 text-white flex items-center hover:bg-secondary"
//         //     >
//         //         <span className="px-2">Send</span>
//         //         <IoMdSend />
//         //     </Button>
//         // </form>
//     );
// }
