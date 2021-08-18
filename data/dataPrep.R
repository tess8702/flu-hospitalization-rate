rm(list=ls())
library(readr)
library(tidyverse)

dir="/Users/huan/Documents/GitHub/data-science-ready-js-app/Flu-Hospitalization-Rate/data"
fluRate<-read.csv(paste0(dir,"/LabConfirmedMasterData.csv"),header = TRUE)%>%
  rename(ageCategory=AGE.CATEGORY)%>%
  filter(ageCategory!="65+ yr")%>%
  mutate(ageOrder=recode(ageCategory,"0-4 yr"=1,"5-17 yr"=2,"18-49 yr"=3,"50-64 yr"=4
                         ,"65-74 yr"=5,"75-84 yr"=6,"85+"=7,"Overall"=8))


write.csv(fluRate,paste0(dir,"LabConfirmedFluRateData.csv"))