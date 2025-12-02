-- SQL Query for IBM i Production Data
-- Run this on IBM i system: 10.247.194.1
-- Database: WAVEDLIB
-- User: FA01001

SELECT SUBSTR(COMP_DAY,1,6) AS YEAR_MONTH,
       COMP_DAY, 
       LINE1, 
       LINE2, 
       LN_NAME, 
       PR, 
       ITEM, 
       ITEM1, 
       ITEM2,
       EST_PRO_QTY, 
       ACT_PRO_QTY, 
       UNIT, 
       SIZE, 
       CH
FROM WAVEDLIB.ProductionData
WHERE LINE1 IN ('111','121','122','161','312','315','313')
  AND SUBSTR(COMP_DAY,1,6) BETWEEN '202504' AND '202512'
ORDER BY COMP_DAY DESC;