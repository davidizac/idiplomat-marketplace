"use client";

import { Button } from "@ui/components/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@ui/components/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@ui/components/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import * as React from "react";
import { cn } from "../../../utils/cn";

export interface ComboboxOption {
	value: string;
	label: string;
}

export interface ComboboxProps {
	options: ComboboxOption[];
	value?: string;
	onValueChange?: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	className?: string;
	disabled?: boolean;
	allowClear?: boolean;
}

export function Combobox({
	options,
	value,
	onValueChange,
	placeholder = "Select an option...",
	searchPlaceholder = "Search...",
	emptyText = "No results found.",
	className,
	disabled = false,
	allowClear = false,
}: ComboboxProps) {
	const [open, setOpen] = React.useState(false);
	const [search, setSearch] = React.useState("");

	const selectedOption = options.find((option) => option.value === value);

	const handleSelect = (currentValue: string) => {
		if (currentValue === value) {
			onValueChange?.("");
			setOpen(false);
			return;
		}
		onValueChange?.(currentValue);
		setOpen(false);
		setSearch("");
	};

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		onValueChange?.("");
		setSearch("");
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					aria-haspopup="listbox"
					aria-controls="combobox-options"
					className={cn(
						"w-full justify-between",
						!value && "text-muted-foreground",
						className,
					)}
					disabled={disabled}
				>
					<span className="truncate">
						{selectedOption ? selectedOption.label : placeholder}
					</span>
					<div className="flex items-center gap-2">
						{allowClear && value && (
							<X
								className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
								onClick={handleClear}
							/>
						)}
						<ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
					</div>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0" align="start">
				<Command shouldFilter={false}>
					<CommandInput
						placeholder={searchPlaceholder}
						value={search}
						onValueChange={setSearch}
					/>
					<CommandList>
						<CommandEmpty>{emptyText}</CommandEmpty>
						<CommandGroup>
							{options
								.filter((option) =>
									option.label
										.toLowerCase()
										.includes(search.toLowerCase()),
								)
								.map((option) => (
									<CommandItem
										key={option.value}
										value={option.value}
										onSelect={handleSelect}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === option.value
													? "opacity-100"
													: "opacity-0",
											)}
										/>
										{option.label}
									</CommandItem>
								))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
