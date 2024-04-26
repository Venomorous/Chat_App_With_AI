// "use client";
// import { useEffect, useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { MdModeEdit } from "react-icons/md";
// import { VscDebugRestart } from "react-icons/vsc";
// import { IoMdSend, IoMdSave } from "react-icons/io";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { UseFormReturn } from "react-hook-form";

// import {
//     messageFormSchema,
//     MessageFormValues,
//     useMessageForm,
// } from "@/lib/formSchemas";
// import {
//     FormField,
//     FormItem,
//     FormControl,
//     FormMessage,
// } from "@/components/ui/form";

// type AIResponseModalProps = {
//     AIResponse?: string | null;
//     regenerate: () => void;
//     form: UseFormReturn<MessageFormValues>;
//     onSubmit: () => void; // This is the submission handler
// };

// export default function AIResponseModal({
//     AIResponse,
//     regenerate,
//     form,
//     onSubmit,
// }: AIResponseModalProps) {
//     const [editable, setEditable] = useState<boolean>(false); // State to track if input is editable

//     const handleEditClick = () => {
//         setEditable(!editable); // Toggle editable state
//     };

//     const handleSubmit = () => {
//         onSubmit(); // Call the submission handler
//         setEditable(false); // Set editable state to false
//     };

//     return (
//         <div className="bg-secondary rounded-lg mx-2 py-2 px-4">
//             <p className="pl-1 pb-2">Generated Answer</p>
//             <Input
//                 className={`h-3/5 py-2 bg-secondary-300 rounded-lg focus:outline-none text-white
//                 disabled:cursor-default disabled:opacity-100`}
//                 disabled={!editable}
//                 // value={AIResponse}
//             ></Input>
//             <div className="flex flex-row mt-1">
//                 <Button
//                     className="px-1 h-6 bg-transparent ml-1"
//                     onClick={regenerate}
//                 >
//                     Regenerate
//                     <span className="px-1">
//                         <VscDebugRestart />
//                     </span>
//                 </Button>
//                 <Button
//                     className="px-1 h-6 bg-transparent"
//                     onClick={handleEditClick}
//                 >
//                     {editable ? (
//                         <>
//                             <p>Save</p>
//                             <span className="px-1">
//                                 <IoMdSave />
//                             </span>
//                         </>
//                     ) : (
//                         <>
//                             <p>Edit</p>
//                             <span className="px-1">
//                                 <MdModeEdit />
//                             </span>
//                         </>
//                     )}
//                 </Button>
//                 <Button className="px-1 h-6 ml-auto mr-1 bg-transparent">
//                     Send
//                     <span className="px-1">
//                         <IoMdSend />
//                     </span>
//                 </Button>
//             </div>
//         </div>
//         // <FormField
//         //     control={form.control}
//         //     name="message"
//         //     render={({ field }) => {
//         //         return (
//         //             <FormItem className="w-full mr-2">
//         //                 <FormControl>
//         //                     <Input
//         //                         type="text"
//         //                         id="message"
//         //                         placeholder="Type your message..."
//         //                         className="h-3/5 px-3 py-2 bg-primary-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 text-white"
//         //                         {...field}
//         //                     />
//         //                 </FormControl>
//         //                 <FormMessage />
//         //             </FormItem>
//         //         );
//         //     }}
//         // />
//     );
// }
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MdModeEdit } from "react-icons/md";
import { VscDebugRestart } from "react-icons/vsc";
import { IoMdSend, IoMdSave } from "react-icons/io";
import { UseFormReturn } from "react-hook-form";
import { MessageFormValues } from "@/lib/formSchemas";

type AIResponseModalProps = {
    AIResponse?: string | null;
    regenerate: () => void;
    form: UseFormReturn<MessageFormValues>;
    onSubmit: () => void; // Updated to handle form submission without arguments
    onClose: () => void; // New prop to handle modal close
};

function extractTextFromAIResponse(response: any) {
    // Assuming AIResponse is passed as a prop and it follows the structure you provided
    if (
        response &&
        response.message &&
        Array.isArray(response.message.content)
    ) {
        const textContent = response.message.content.find(
            (content: any) => content.type === "text"
        );
        return textContent ? textContent.text : "";
    }
    return "";
}

export default function AIResponseModal({
    AIResponse,
    regenerate,
    form,
    onSubmit,
    onClose,
}: AIResponseModalProps) {
    const [editable, setEditable] = useState<boolean>(false);
    const [editedResponse, setEditedResponse] = useState<string>(
        extractTextFromAIResponse(AIResponse) || ""
    );

    // const [editedResponse, setEditedResponse] = useState<string>("");

    useEffect(() => {
        // Ensure that when AIResponse changes, the local state updates
        const initialText = extractTextFromAIResponse(AIResponse);
        setEditedResponse(initialText);
    }, [AIResponse]);

    const handleEditClick = () => {
        // If currently editable, save the changes and close the editable state
        if (editable) {
            form.setValue("message", editedResponse); // Update the form's 'message' field to the edited response
            setEditable(false);
        } else {
            // Make input editable
            setEditable(true);
        }
    };

    const handleSubmitClick = () => {
        console.log("Submitting", editedResponse);

        form.setValue("message", editedResponse);
        setEditable(false);

        onSubmit();
        onClose(); // Close the modal after submission
    };

    return (
        <div className="bg-secondary rounded-lg mx-2 py-2 px-4">
            <p className="pl-1 pb-2">Generated Answer</p>
            <Input
                value={editedResponse}
                onChange={(e) => setEditedResponse(e.target.value)}
                className="h-auto py-2 bg-secondary-300 rounded-lg focus:outline-none text-white"
                disabled={!editable}
            />
            <div className="flex flex-row mt-1">
                <Button
                    type="button"
                    className="px-1 h-6 bg-transparent ml-1"
                    onClick={regenerate}
                >
                    Regenerate
                    <VscDebugRestart />
                </Button>
                <Button
                    type="button"
                    className="px-1 h-6 bg-transparent"
                    onClick={handleEditClick}
                >
                    {editable ? "Save" : "Edit"}
                    {editable ? <IoMdSave /> : <MdModeEdit />}
                </Button>
                <Button
                    type="button"
                    className="px-1 h-6 ml-auto mr-1 bg-transparent"
                    onClick={handleSubmitClick}
                >
                    Send
                    <IoMdSend />
                </Button>
            </div>
        </div>
    );
}
