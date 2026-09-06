"use client";

import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	PRICE_FILTER_CEILING,
	UNSET_PRICE_RANGE,
	displayPriceBound,
} from "../../lib/format";

interface PriceRangeFilterProps {
	onChange: (range: [number, number]) => void;
	initialRange: [number, number];
	maxPrice?: number;
	minPrice?: number;
	currency?: string;
	label?: string;
}

export function PriceRangeFilter({
	onChange,
	initialRange = UNSET_PRICE_RANGE,
	maxPrice = PRICE_FILTER_CEILING,
	minPrice = 0,
	currency = "₪",
	label,
}: PriceRangeFilterProps) {
	const t = useTranslations("marketplace.filters");
	const resolvedLabel = label ?? t("priceRange");
	const isInitialMount = useRef(true);
	const onChangeRef = useRef(onChange);
	const lastCommittedRef = useRef<[number, number]>(initialRange);

	const [minInput, setMinInput] = useState<string>(
		displayPriceBound(initialRange[0]),
	);
	const [maxInput, setMaxInput] = useState<string>(
		displayPriceBound(initialRange[1]),
	);

	useEffect(() => {
		onChangeRef.current = onChange;
	}, [onChange]);

	useEffect(() => {
		const [newMin, newMax] = initialRange;
		const [lastMin, lastMax] = lastCommittedRef.current;

		if (newMin !== lastMin || newMax !== lastMax) {
			setMinInput(displayPriceBound(newMin));
			setMaxInput(displayPriceBound(newMax));
			lastCommittedRef.current = initialRange;
		}
	}, [initialRange]);

	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}

		const minValue = minInput === "" ? 0 : Number.parseInt(minInput, 10);
		const maxValue = maxInput === "" ? 0 : Number.parseInt(maxInput, 10);

		if (Number.isNaN(minValue) || Number.isNaN(maxValue)) {
			return;
		}

		const timer = setTimeout(() => {
			const constrainedMin = Math.max(minPrice, minValue);
			const constrainedMax =
				maxValue > 0 ? Math.min(maxPrice, maxValue) : 0;

			lastCommittedRef.current = [constrainedMin, constrainedMax];
			onChangeRef.current([constrainedMin, constrainedMax]);
		}, 500);

		return () => clearTimeout(timer);
	}, [minInput, maxInput, minPrice, maxPrice]);

	const handleMinChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			if (value === "" || /^\d+$/.test(value)) {
				setMinInput(value);
			}
		},
		[],
	);

	const handleMaxChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			if (value === "" || /^\d+$/.test(value)) {
				setMaxInput(value);
			}
		},
		[],
	);

	const handleMinBlur = useCallback(() => {
		if (minInput === "") {
			setMinInput("");
			return;
		}

		const value = Number.parseInt(minInput, 10);
		if (Number.isNaN(value)) {
			setMinInput("");
			return;
		}

		const parsedMax = Number.parseInt(maxInput, 10);
		const constrainedValue = Math.max(
			minPrice,
			Number.isNaN(parsedMax) || parsedMax <= 0
				? value
				: Math.min(value, parsedMax),
		);
		setMinInput(String(constrainedValue));
	}, [minInput, maxInput, minPrice]);

	const handleMaxBlur = useCallback(() => {
		if (maxInput === "") {
			setMaxInput("");
			return;
		}

		const value = Number.parseInt(maxInput, 10);
		if (Number.isNaN(value)) {
			setMaxInput("");
			return;
		}

		const parsedMin = Number.parseInt(minInput, 10);
		const constrainedValue = Math.min(
			maxPrice,
			Math.max(value, Number.isNaN(parsedMin) ? minPrice : parsedMin),
		);
		setMaxInput(String(constrainedValue));
	}, [minInput, maxInput, minPrice, maxPrice]);

	return (
		<div className="space-y-2">
			<Label className="text-sm font-medium">{resolvedLabel}</Label>
			<div className="flex items-center gap-3">
				<div className="flex-1">
					<div className="relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
							{currency}
						</span>
						<Input
							id="price-min"
							type="number"
							placeholder={t("min")}
							className="pl-8 h-10"
							value={minInput}
							onChange={handleMinChange}
							onBlur={handleMinBlur}
							min={minPrice}
							max={maxPrice}
							aria-label={t("minPriceAria")}
						/>
					</div>
				</div>
				<span className="text-muted-foreground text-sm">{t("to")}</span>
				<div className="flex-1">
					<div className="relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
							{currency}
						</span>
						<Input
							id="price-max"
							type="number"
							placeholder={t("max")}
							className="pl-8 h-10"
							value={maxInput}
							onChange={handleMaxChange}
							onBlur={handleMaxBlur}
							min={minPrice}
							max={maxPrice}
							aria-label={t("maxPriceAria")}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
