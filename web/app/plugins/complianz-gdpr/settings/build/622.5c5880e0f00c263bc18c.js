"use strict";(self.webpackChunkcomplianz_gdpr=self.webpackChunkcomplianz_gdpr||[]).push([[622],{90622:(e,r,t)=>{t.r(r),t.d(r,{default:()=>n});var a=t(81621),s=t(9588),o=t(16535);t(86087);const n=(0,a.vt)(((e,r)=>({recordsLoaded:!1,searchValue:"",setSearchValue:r=>e({searchValue:r}),status:"open",setStatus:r=>e({status:r}),selectedRecords:[],setSelectedRecords:r=>e({selectedRecords:r}),fetching:!1,generating:!1,progress:!1,records:[],totalRecords:0,totalOpen:0,exportLink:"",noData:!1,indeterminate:!1,setIndeterminate:r=>e({indeterminate:r}),paginationPerPage:10,pagination:{currentPage:1},setPagination:r=>e({pagination:r}),orderBy:"ID",setOrderBy:r=>e({orderBy:r}),order:"DESC",setOrder:r=>e({order:r}),deleteRecords:async t=>{let a={};a.per_page=r().paginationPerPage,a.page=r().pagination.currentPage,a.order=r().order.toUpperCase(),a.orderBy=r().orderBy,a.search=r().searchValue,a.status=r().status;let o=r().records.filter((e=>t.includes(e.ID)));e((e=>({records:e.records.filter((e=>!t.includes(e.ID)))}))),a.records=o,await s.doAction("delete_datarequests",a).then((e=>e)).catch((e=>{console.error(e)})),await r().fetchData(),r().setSelectedRecords([]),r().setIndeterminate(!1)},resolveRecords:async t=>{let a={};a.per_page=r().paginationPerPage,a.page=r().pagination.currentPage,a.order=r().order.toUpperCase(),a.orderBy=r().orderBy,a.search=r().searchValue,a.status=r().status,e((0,o.Ay)((e=>{e.records.forEach((function(r,a){t.includes(r.ID)&&(e.records[a].resolved=!0)}))}))),a.records=r().records.filter((e=>t.includes(e.ID))),await s.doAction("resolve_datarequests",a).then((e=>e)).catch((e=>{console.error(e)})),await r().fetchData(),r().setSelectedRecords([]),r().setIndeterminate(!1)},fetchData:async()=>{if(r().fetching)return;e({fetching:!0});let t={};t.per_page=r().paginationPerPage,t.page=r().pagination.currentPage,t.order=r().order.toUpperCase(),t.orderBy=r().orderBy,t.search=r().searchValue,t.status=r().status;const{records:a,totalRecords:o,totalOpen:n}=await s.doAction("get_datarequests",t).then((e=>e)).catch((e=>{console.error(e)}));e((()=>({recordsLoaded:!0,records:a,totalRecords:o,totalOpen:n,fetching:!1})))},startExport:async()=>{e({generating:!0,progress:0,exportLink:""})},fetchExportDatarequestsProgress:async(r,t,a)=>{(r=void 0!==r&&r)||e({generating:!0});let o={};o.startDate=t,o.endDate=a,o.statusOnly=r;const{progress:n,exportLink:c,noData:d}=await s.doAction("export_datarequests",o).then((e=>e)).catch((e=>{console.error(e)}));let i=!1;n<100&&(i=!0),e({progress:n,exportLink:c,generating:i,noData:d})}})))}}]);