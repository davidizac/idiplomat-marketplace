/**
 * Attribute Field Component
 * Renders individual attribute inputs based on their type
 */

"use client";

import { Button } from "@ui/components/button";
import { Calendar } from "@ui/components/calendar";
import { Checkbox } from "@ui/components/checkbox";
import { Label } from "@ui/components/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@ui/components/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { Slider } from "@ui/components/slider";
import { Switch } from "@ui/components/switch";
import { cn } from "@ui/lib";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type {
	AttributeDefinition,
	AttributeValue,
} from "../../lib/attribute-utils";

interface AttributeFieldProps {
	definition: AttributeDefinition;
	value: AttributeValue;
	onChange: (value: AttributeValue) => void;
	error?: string;
}

export function AttributeField({
	definition,
	value,
	onChange,
	error,
}: AttributeFieldProps) {
	switch (definition.type) {
		case "text": {
			return (
				<div className="space-y-2">
					<Label htmlFor={definition.documentId}>
						{definition.name}
						{definition.required && (
							<span className="text-destructive ml-1">*</span>
						)}
					</Label>
					<input
						id={definition.documentId}
						type="text"
						className={cn(
							"w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
							error &&
								"border-destructive focus:border-destructive",
						)}
						value={(value as string) || ""}
						onChange={(e) => onChange(e.target.value)}
						placeholder={`Enter ${definition.name.toLowerCase()}`}
					/>
				</div>
			);
		}

		case "number": {
			const numValue = typeof value === "number" ? value : 0;
			const min = (definition.metadata.minimum as number) ?? 0;
			const max = (definition.metadata.maximum as number) ?? 1000;
			const step = (definition.metadata.step as number) ?? 1;

			return (
				<div className="space-y-4">
					<div className="flex justify-start items-center gap-2">
						<Label htmlFor={definition.documentId}>
							{definition.name}
							{definition.required && (
								<span className="text-destructive ml-1">*</span>
							)}
						</Label>
						<span className="text-sm text-muted-foreground">
							{numValue}
						</span>
					</div>
					<Slider
						id={definition.documentId}
						min={min}
						max={max}
						step={step}
						value={[numValue]}
						onValueChange={(vals: number[]) => onChange(vals[0])}
					/>
				</div>
			);
		}

		case "boolean": {
			return (
				<div className="flex items-center justify-between">
					<Label htmlFor={definition.documentId} className="flex-1">
						{definition.name}
						{definition.required && (
							<span className="text-destructive ml-1">*</span>
						)}
					</Label>
					<Switch
						id={definition.documentId}
						checked={Boolean(value)}
						onCheckedChange={(checked: boolean) =>
							onChange(checked)
						}
					/>
				</div>
			);
		}

		case "date": {
			const dateValue = value instanceof Date ? value : null;
			return (
				<div className="space-y-2">
					<Label>
						{definition.name}
						{definition.required && (
							<span className="text-destructive ml-1">*</span>
						)}
					</Label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									"w-full justify-start text-left font-normal",
									!dateValue && "text-muted-foreground",
									error && "border-destructive",
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{dateValue
									? format(dateValue, "PPP")
									: `Select ${definition.name.toLowerCase()}`}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0">
							<Calendar
								mode="single"
								selected={dateValue || undefined}
								onSelect={(date: Date | undefined) =>
									onChange(date || null)
								}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
				</div>
			);
		}

		case "select": {
			if (!definition.options || definition.options.length === 0) {
				return null;
			}

			return (
				<div className="space-y-2">
					<Label htmlFor={definition.documentId}>
						{definition.name}
						{definition.required && (
							<span className="text-destructive ml-1">*</span>
						)}
					</Label>
					<Select
						value={(value as string) || ""}
						onValueChange={(val: string) => onChange(val)}
					>
						<SelectTrigger
							id={definition.documentId}
							className={cn(error && "border-destructive")}
						>
							<SelectValue
								placeholder={`Select ${definition.name.toLowerCase()}`}
							/>
						</SelectTrigger>
						<SelectContent>
							{definition.options.map((option) => (
								<SelectItem key={option} value={option}>
									{option}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			);
		}

		case "multi-select": {
			if (!definition.options || definition.options.length === 0) {
				return null;
			}

			const multiValues = Array.isArray(value) ? value : [];

			return (
				<div className="space-y-3">
					<Label>
						{definition.name}
						{definition.required && (
							<span className="text-destructive ml-1">*</span>
						)}
					</Label>
					<div className="space-y-2">
						{definition.options.map((option) => (
							<div
								key={option}
								className="flex items-center space-x-2"
							>
								<Checkbox
									id={`${definition.documentId}-${option}`}
									checked={multiValues.includes(option)}
									onCheckedChange={(checked: boolean) => {
										if (checked) {
											onChange([...multiValues, option]);
										} else {
											onChange(
												multiValues.filter(
													(item) => item !== option,
												),
											);
										}
									}}
								/>
								<Label
									htmlFor={`${definition.documentId}-${option}`}
									className="text-sm font-normal"
								>
									{option}
								</Label>
							</div>
						))}
					</div>
				</div>
			);
		}

		default:
			return null;
	}
}
