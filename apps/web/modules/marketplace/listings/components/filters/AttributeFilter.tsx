"use client";

import type { Attribute } from "@repo/cms";
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

// Types for the different attribute values
export type AttributeValue = string | string[] | number | boolean | Date | null;

// Map of attribute ID to value
export type AttributeFilterValues = Record<number, AttributeValue>;

interface AttributeFilterProps {
	attribute: Attribute;
	value: AttributeValue;
	onChange: (attributeId: number, value: AttributeValue) => void;
}

export function AttributeFilter({
	attribute,
	value,
	onChange,
}: AttributeFilterProps) {
	// Handle the different attribute types
	switch (attribute.type) {
		case "text": {
			return (
				<div className="space-y-2">
					<Label htmlFor={`attr-${attribute.id}`}>
						{attribute.name}
					</Label>
					<input
						id={`attr-${attribute.id}`}
						type="text"
						className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						value={(value as string) || ""}
						onChange={(e) => onChange(attribute.id, e.target.value)}
						placeholder={`Enter ${attribute.name.toLowerCase()}`}
					/>
				</div>
			);
		}

		case "number": {
			const numValue = typeof value === "number" ? value : 0;
			return (
				<div className="space-y-4">
					<div className="flex justify-between">
						<Label htmlFor={`attr-${attribute.id}`}>
							{attribute.name}
						</Label>
						<span className="text-sm text-muted-foreground">
							{numValue}
						</span>
					</div>
					<Slider
						id={`attr-${attribute.id}`}
						min={(attribute.metadata?.minimum as number) ?? 0}
						max={(attribute.metadata?.maximum as number) ?? 1000}
						step={(attribute.metadata?.step as number) ?? 1}
						value={[numValue]}
						onValueChange={(vals: number[]) =>
							onChange(attribute.id, vals[0])
						}
					/>
				</div>
			);
		}

		case "boolean": {
			return (
				<div className="flex items-center justify-between">
					<Label htmlFor={`attr-${attribute.id}`} className="flex-1">
						{attribute.name}
					</Label>
					<Switch
						id={`attr-${attribute.id}`}
						checked={Boolean(value)}
						onCheckedChange={(checked: boolean) =>
							onChange(attribute.id, checked)
						}
					/>
				</div>
			);
		}

		case "date": {
			const dateValue = value instanceof Date ? value : null;
			return (
				<div className="space-y-2">
					<Label>{attribute.name}</Label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									"w-full justify-start text-left font-normal",
									!dateValue && "text-muted-foreground",
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{dateValue
									? format(dateValue, "PPP")
									: `Select ${attribute.name.toLowerCase()}`}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0">
							<Calendar
								mode="single"
								selected={dateValue || undefined}
								onSelect={(date: Date | undefined) =>
									onChange(attribute.id, date || null)
								}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
				</div>
			);
		}

		case "select": {
			if (!attribute.options || attribute.options.length === 0) {
				return null;
			}

			return (
				<div className="space-y-2">
					<Label htmlFor={`attr-${attribute.id}`}>
						{attribute.name}
					</Label>
					<Select
						value={(value as string) || ""}
						onValueChange={(val: string) =>
							onChange(attribute.id, val)
						}
					>
						<SelectTrigger id={`attr-${attribute.id}`}>
							<SelectValue
								placeholder={`Select ${attribute.name.toLowerCase()}`}
							/>
						</SelectTrigger>
						<SelectContent>
							{attribute.options.map((option) => (
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
			if (!attribute.options || attribute.options.length === 0) {
				return null;
			}

			const multiValues = Array.isArray(value) ? value : [];

			return (
				<div className="space-y-3">
					<Label>{attribute.name}</Label>
					<div className="space-y-2">
						{attribute.options.map((option) => (
							<div
								key={option}
								className="flex items-center space-x-2"
							>
								<Checkbox
									id={`attr-${attribute.id}-${option}`}
									checked={multiValues.includes(option)}
									onCheckedChange={(checked: boolean) => {
										if (checked) {
											onChange(attribute.id, [
												...multiValues,
												option,
											]);
										} else {
											onChange(
												attribute.id,
												multiValues.filter(
													(item) => item !== option,
												),
											);
										}
									}}
								/>
								<Label
									htmlFor={`attr-${attribute.id}-${option}`}
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
