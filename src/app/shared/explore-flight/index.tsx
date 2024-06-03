'use client';

import { useState } from 'react';
import cn from '@/utils/class-names';
import { Tags } from '@/app/shared/explore-flight/listing-filters/tags';
import OurAdvice from '@/app/shared/explore-flight/listing-filters/our-advice';
import FilterWithSearch from '@/components/filter-with-search';
import { useFilterControls } from '@/hooks/use-filter-control';
import {
  airlinesData,
  bookingData,
  flightListingData,
  initialState,
  layoverAirportsData,
  paymentMethods,
  recommendedData,
  stopsData,
} from '@/app/shared/explore-flight/listing-filters/filter-utils';
import FareAssistant from '@/app/shared/explore-flight/listing-filters/fare-assistant';
import FlightTimes from '@/app/shared/explore-flight/listing-filters/flight-times';
import BookOnTripFinder from '@/app/shared/explore-flight/listing-filters/book-on-tripfinder';
import PriceFilter from '@/app/shared/explore-flight/listing-filters/price-filter';
import FlightBookingCard from '@/components/cards/flight-booking-card';
import FilterWithAccordion from '@/components/filter-with-accordion';
import FlightTimesWithAccordion from '@/app/shared/explore-flight/listing-filters/flight-times-with-accordion';
import FilterWithGroup from '@/components/filter-with-group';
import { Button } from '@/components/ui/button';
import hasSearchedParams from '@/utils/has-searched-params';
import { shuffle } from 'lodash';

let countPerPage = 6;

export default function ListingFilters({ className }: { className?: string }) {
  const [isLoading, setLoading] = useState(false);
  const [nextPage, setNextPage] = useState(countPerPage);
  const { state, applyFilter, clearFilter, reset } = useFilterControls<
    typeof initialState,
    any
  >(initialState);

  function handleLoadMore() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setNextPage(nextPage + countPerPage);
    }, 600);
  }

  const filteredData = hasSearchedParams()
    ? shuffle(flightListingData)
    : flightListingData;

  return (
    <div className={cn('grid grid-cols-12 gap-5 @7xl:gap-10', className)}>
      <div className="col-span-full @5xl:col-span-9">
        <Tags />
        <div>
          <div className="mt-5 flex flex-col gap-7">
            {filteredData?.slice(0, nextPage)?.map((flight, index) => (
              <FlightBookingCard key={index} data={flight} />
            ))}
          </div>

          {nextPage < flightListingData?.length && (
            <div className="mb-4 mt-5 flex flex-col items-center xs:pt-6 sm:pt-8">
              <Button
                isLoading={isLoading}
                onClick={() => handleLoadMore()}
                className="dark:bg-gray-100 dark:text-white dark:active:bg-gray-100"
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="col-span-full divide-y @5xl:col-span-3">
        <OurAdvice reset={reset} />
        <FilterWithAccordion
          title="Recommended Filters"
          name="recommended"
          data={recommendedData}
          isPrice
          state={state}
          applyFilter={applyFilter}
          clearFilter={clearFilter}
        />
        <div className="py-5">
          <FilterWithSearch
            title="Stops"
            name="stops"
            data={stopsData}
            state={state}
            applyFilter={applyFilter}
            clearFilter={clearFilter}
          />
        </div>
        <div className="py-5">
          <FareAssistant
            title="Fare Assistant"
            name="fare-assistant"
            data={paymentMethods}
            state={state}
            applyFilter={applyFilter}
            clearFilter={clearFilter}
          />
        </div>
        <FlightTimes
          title="Times"
          name="times"
          isTabs
          data={stopsData}
          state={state}
          applyFilter={applyFilter}
          clearFilter={clearFilter}
        />
        <div className="py-5">
          <FilterWithSearch
            title="Airlines"
            name="airlines"
            data={airlinesData}
            isSelectableTabs
            state={state}
            applyFilter={applyFilter}
            clearFilter={clearFilter}
          />
        </div>
        <FilterWithAccordion
          title="Booking Status"
          name="status"
          data={bookingData}
          state={state}
          applyFilter={applyFilter}
          clearFilter={clearFilter}
        />
        <BookOnTripFinder
          title="Book on Tripfinder"
          name="tripfinder"
          state={state}
          applyFilter={applyFilter}
          clearFilter={clearFilter}
        />
        <FlightTimesWithAccordion
          title="Duration"
          name="times"
          isTabs={false}
          data={stopsData}
          state={state}
          applyFilter={applyFilter}
          clearFilter={clearFilter}
        />
        <PriceFilter title="Price" state={state} applyFilter={applyFilter} />
        <FilterWithAccordion
          title="Alliance"
          name="alliance"
          data={bookingData}
          state={state}
          applyFilter={applyFilter}
          clearFilter={clearFilter}
        />
        <FilterWithAccordion
          title="Cabin"
          name="cabin"
          data={bookingData}
          state={state}
          applyFilter={applyFilter}
          clearFilter={clearFilter}
        />
        <FilterWithGroup
          title="Layover Airports"
          name="layover"
          data={layoverAirportsData}
          state={state}
          applyFilter={applyFilter}
          clearFilter={clearFilter}
        />
        <FilterWithAccordion
          title="Aircraft"
          name="layover"
          data={bookingData}
          state={state}
          applyFilter={applyFilter}
          clearFilter={clearFilter}
        />
        <div className="py-5">
          <FilterWithSearch
            title="Model"
            name="model"
            data={airlinesData}
            isCheckBoxFilter
            state={state}
            applyFilter={applyFilter}
            clearFilter={clearFilter}
          />
        </div>
      </div>
    </div>
  );
}
