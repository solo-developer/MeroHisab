﻿using MeroHisab.Core.Dto;
using MeroHisab.Core.Entities;

namespace MeroHisab.Core.Services.Interface
{
    public interface IReportService
    {
        void CorrectIncomeLedgerDtoBalances(List<LedgerAmountDto> incomeLedgerBalanceDtos);
        Task<BalanceSheetDto> GetBalanceSheetDto(DateTime start_date, DateTime end_date);
        Task<ProfitAndLossDto> GetProfitAndLossDto(DateTime start_date, DateTime end_date);
        Task<TrialBalanceDto> GetTrialBalanceDto(DateTime start_date, DateTime end_date);
        Task<List<TransactionSummary>> GetTransactionWithin(DateTime start_date, DateTime end_date);
        Task<List<TransactionDetail>> GetTransactionDetailsWithinForLedger(DateTime start_date, DateTime end_date, long ledger_id);
        Task<List<TransactionDetail>> GetTransactionDetailsForLedgerWithDate(DateTime date, long ledger_id);
    }
}