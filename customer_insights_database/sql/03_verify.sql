-- Verify that all supplied raw records were imported. Raises an error if a check fails.
BEGIN;
SET LOCAL TIME ZONE 'UTC';
DO $assessment_verify$
BEGIN
    IF (SELECT count(*) FROM public.customers) <> 250 THEN
        RAISE EXCEPTION 'Expected 250 rows in customers';
    END IF;
    IF (SELECT count(*) FROM public.staff) <> 12 THEN
        RAISE EXCEPTION 'Expected 12 rows in staff';
    END IF;
    IF (SELECT count(*) FROM public.deals) <> 3000 THEN
        RAISE EXCEPTION 'Expected 3000 rows in deals';
    END IF;
    RAISE NOTICE 'Assessment dataset checks passed';
END;
$assessment_verify$;
COMMIT;
