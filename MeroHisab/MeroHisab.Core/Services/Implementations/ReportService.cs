using MeroHisab.Core.Dto;
using MeroHisab.Core.Dto.Report;
using MeroHisab.Core.Entities;
using MeroHisab.Core.Repository.Interface;
using MeroHisab.Core.Services.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MeroHisab.Core.Services.Implementations
{
    public class ReportService : IReportService
    {
        private readonly ILedgerRepository ledgerRepository;
        private readonly ITransactionDetailRepository transactionDetailRepo;
        private readonly ITransactionRepository _transactionRepo;

        public ReportService(ITransactionRepository transactionRepo, ILedgerRepository _ledgerRepository, ITransactionDetailRepository _transactionDetailRepo)
        {
            ledgerRepository = _ledgerRepository;
            transactionDetailRepo = _transactionDetailRepo;
            _transactionRepo = transactionRepo;
        }

        private Task<List<Ledger>> getAllLedgersBelongingToAssetsGroup()
        {
            return ledgerRepository.GetLedgersUnderAssetsGroup();
        }

        private Task<List<Ledger>> getAllLedgerBelongingToLiabilitiesGroup()
        {
            return ledgerRepository.GetLedgersUnderLiabilitiesGroup();
        }

        private Task<List<Ledger>> getAllLedgerBelongingToIncomeGroup()
        {
            return ledgerRepository.GetLedgersUnderIncomeGroup();
        }

        private Task<List<Ledger>> getAllLedgerBelongingToExpensesGroup()
        {
            return ledgerRepository.GetLedgersUnderExpensesGroup();
        }


        public async Task<TrialBalanceDto> GetTrialBalanceDto(DateTime start_date, DateTime end_date)
        {
            TrialBalanceDto trialBalanceDto = new TrialBalanceDto();
            List<LedgerAmountDto> liabilyLedgerAmountDto = await getLiabilyLedgerAmountDtosof(start_date, end_date);
            List<LedgerAmountDto> assetsLedgerAmountDto = await getAssetsLedgerAmountDtosof(start_date, end_date);
            List<LedgerAmountDto> incomeLedgerAmountDto = await getIncomeLedgerAmountDtosof(start_date, end_date);
            List<LedgerAmountDto> expensesLedgerAmountDto = await getExpensesLedgerAmountDtosof(start_date, end_date);
            trialBalanceDto.AddAssetsLedgerBalanceDto(assetsLedgerAmountDto);
            trialBalanceDto.AddLiabilityLedgerBalanceDto(liabilyLedgerAmountDto);
            trialBalanceDto.AddIncomeLedgerBalanceDto(incomeLedgerAmountDto);
            trialBalanceDto.AddExpensesLedgerBalanceDto(expensesLedgerAmountDto);

            return trialBalanceDto;
        }

        public async Task<ProfitAndLossDto> GetProfitAndLossDto(DateTime start_date, DateTime end_date)
        {
            ProfitAndLossDto profitLossDto = new ProfitAndLossDto();
            List<LedgerAmountDto> incomeLedgerAmountDto = await getIncomeLedgerAmountDtosof(start_date, end_date);
            CorrectIncomeLedgerDtoBalances(incomeLedgerAmountDto);
            List<LedgerAmountDto> expensesLedgerAmountDto = await getExpensesLedgerAmountDtosof(start_date, end_date);

            profitLossDto.AddIncomeLedgerAmountDto(incomeLedgerAmountDto);
            profitLossDto.AddExpensesLedgerAmountDto(expensesLedgerAmountDto);

            decimal netAmountLastYear = await getNetAmountOf(start_date);

            profitLossDto.OpeningBalance = netAmountLastYear;
            return profitLossDto;
        }


        public async Task<BalanceSheetDto> GetBalanceSheetDto(DateTime start_date, DateTime end_date)
        {
            BalanceSheetDto balanceSheetDto = new BalanceSheetDto();
            List<LedgerAmountDto> assetLedgerDto = await getAssetsLedgerAmountDtosof(start_date, end_date);
            List<LedgerAmountDto> liabilitesLedgerDto = await getLiabilyLedgerAmountDtosof(start_date, end_date);

            correctLiabilityLedgerDtoBalance(liabilitesLedgerDto);
            decimal netAmountLastyear = await getNetAmountOf(start_date);
            decimal profitOrLossAmount = (await GetProfitAndLossDto(start_date, end_date)).OpeningBalance;

            balanceSheetDto.ProfitAndLossAmount = profitOrLossAmount;
            balanceSheetDto.ClosingBalance = netAmountLastyear;
            balanceSheetDto.AddAssetsLedgerAmountDto(assetLedgerDto);
            balanceSheetDto.AddLiabilitiesLedgerAmountDto(liabilitesLedgerDto);

            return balanceSheetDto;

        }

        private void correctLiabilityLedgerDtoBalance(List<LedgerAmountDto> liabilitesLedgerDto)
        {
            liabilitesLedgerDto.Select(c => { c.Amount = c.Amount * -1; return c; }).ToList();
        }

        private async Task<decimal> getNetAmountOf(DateTime start_date)
        {
            List<Ledger> assetLedgers = await getAllLedgersBelongingToAssetsGroup();
            List<Ledger> liabilityLedgers = await getAllLedgerBelongingToLiabilitiesGroup();

            decimal assetBalance = 0;
            decimal liabilityBalance = 0;
            foreach (var assetLedger in assetLedgers)
            {
                assetBalance += await getLedgerBalanceAmountTillDate(assetLedger.Id, start_date);
            }

            foreach (var liabilityLedger in liabilityLedgers)
            {
                liabilityBalance += await getLedgerBalanceAmountTillDate(liabilityLedger.Id, start_date);
            }

            decimal netAmount = assetBalance - liabilityBalance;
            return netAmount;
        }

        private async Task<List<LedgerAmountDto>> getExpensesLedgerAmountDtosof(DateTime start_date, DateTime end_date)
        {
            List<LedgerAmountDto> dtos = new List<LedgerAmountDto>();
            List<Ledger> expensesLedger = await getAllLedgerBelongingToExpensesGroup();
            await AddDtoInDtosWithAmountBetweenTwoDates(start_date, end_date, dtos, expensesLedger);
            return dtos;
        }

        private async Task<List<LedgerAmountDto>> getIncomeLedgerAmountDtosof(DateTime start_date, DateTime end_date)
        {
            List<LedgerAmountDto> dtos = new List<LedgerAmountDto>();
            List<Ledger> incomeLedger = await getAllLedgerBelongingToIncomeGroup();
            await AddDtoInDtosWithAmountBetweenTwoDates(start_date, end_date, dtos, incomeLedger);
            return dtos;
        }

        private async Task<List<LedgerAmountDto>> getAssetsLedgerAmountDtosof(DateTime start_date, DateTime end_date)
        {
            List<LedgerAmountDto> dtos = new List<LedgerAmountDto>();
            List<Ledger> assetsLedger = await getAllLedgersBelongingToAssetsGroup();
            await AddDtoInDtosWithAmountBetweenTwoDates(start_date, end_date, dtos, assetsLedger);
            return dtos;
        }

        private async Task<List<LedgerAmountDto>> getLiabilyLedgerAmountDtosof(DateTime start_date, DateTime end_date)
        {
            List<LedgerAmountDto> dtos = new List<LedgerAmountDto>();
            List<Ledger> liabilityLedger = await getAllLedgerBelongingToLiabilitiesGroup();
            AddDtoInDtosWithAmountBetweenTwoDates(start_date, end_date, dtos, liabilityLedger);
            return dtos;
        }


        private async Task AddDtoInDtosWithAmountBetweenTwoDates(DateTime start_date, DateTime end_date, List<LedgerAmountDto> dtos, List<Ledger> ledgers)
        {
            foreach (var ledger in ledgers)
            {
                LedgerAmountDto dto = new LedgerAmountDto();
                dto.Ledger = ledger;
                decimal latestBalanceAmt = await getLedgerBalanceAmountBetweenDates(ledger.Id, start_date, end_date);
                decimal startDateBalance = await getLedgerBalanceAmountTillDate(ledger.Id, start_date);
                dto.Amount = latestBalanceAmt;
                dtos.Add(dto);
            }
        }

        private async Task addDtoInDtosWithAmountCalculated(DateTime end_date, List<LedgerAmountDto> dtos, List<Ledger> ledgers)
        {
            foreach (var ledger in ledgers)
            {
                LedgerAmountDto dto = new LedgerAmountDto();
                dto.Ledger = ledger;
                dto.Amount = await getLedgerBalanceAmountTillDate(ledger.Id, end_date);
                dtos.Add(dto);
            }
        }
        private async Task<decimal> getLedgerBalanceAmountBetweenDates(long ledger_id, DateTime start_date, DateTime end_date)
        {
            decimal balance = await transactionDetailRepo.GetLedgerBalanceAmountBetweenDates(ledger_id, start_date, end_date);
            return balance;
        }

        private async Task<decimal> getLedgerBalanceAmountTillDate(long ledger_id, DateTime end_date)
        {
            decimal balance = await transactionDetailRepo.GetOldBalance(ledger_id, end_date);
            return balance;
        }

        public void CorrectIncomeLedgerDtoBalances(List<LedgerAmountDto> incomeLedgerBalanceDtos)
        {
            incomeLedgerBalanceDtos.Select(c => { c.Amount = c.Amount * -1; return c; }).ToList();
        }

        public Task<List<TransactionSummary>> GetTransactionWithin(DateTime start_date, DateTime end_date)
        {
            var transactions = _transactionRepo.AsQueryable().Where(a => a.TransactionDate.Date >= start_date && a.TransactionDate.Date <= end_date).ToListAsync();
            return transactions;
        }

        public async Task<List<ReportTransactionDetailDto>> GetTransactionDetailsWithinForLedger(DateTime start_date, DateTime end_date, long ledger_id)
        {
            var transactionDetails = await transactionDetailRepo.AsQueryable().Where(a => a.TransactionDate.Date >= start_date.Date && a.TransactionDate.Date <= end_date.Date && a.LedgerId == ledger_id).OrderBy(a => a.TransactionDate).ToListAsync();

            var ledgerIds = transactionDetails.Select(a => a.LedgerId).Union(transactionDetails.Select(a => a.RefLedgerId)).Distinct();

            var ledgers = await ledgerRepository.GetQueryable().Where(a => ledgerIds.Contains(a.Id)).ToListAsync();

            var response = new List<ReportTransactionDetailDto>();
            foreach (var transaction in transactionDetails)
            {
                var ledgerDetail = ledgers.Single(a => a.Id == transaction.LedgerId);
                var refLedgerDetail = ledgers.Single(a => a.Id == transaction.RefLedgerId);
                response.Add(new ReportTransactionDetailDto
                {
                    LedgerId=(int)transaction.LedgerId,
                    RefLedgerId=(int)transaction.RefLedgerId,
                    Balance=transaction.Balance,
                    DebitAmount=transaction.DrAmount,
                    CreditAmount=transaction.CrAmount,
                    TransactionDate=transaction.TransactionDate,
                    LedgerCode=ledgerDetail.Code,
                    LedgerName=ledgerDetail.Name,
                    RefLedgerCode=refLedgerDetail.Code,
                    RefLedgerName=refLedgerDetail.Name
                });
            }
            return response;
        }

        public Task<List<TransactionDetail>> GetTransactionDetailsForLedgerWithDate(DateTime date, long ledger_id)
        {
            var transactionDetails = transactionDetailRepo.AsQueryable().Where(a => a.TransactionDate.Date == date && a.LedgerId == ledger_id).ToListAsync();
            return transactionDetails;
        }

    }
}
