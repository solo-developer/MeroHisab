using MeroHisab.Core.Dto;
using MeroHisab.Core.Dto.Report;
using MeroHisab.Core.Entities;
using MeroHisab.Core.Services.Interface;
using MeroHisab.Helpers.Interface;
using MeroHisab.ViewModels.DefaultAccountSetup;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.CommunityToolkit.UI.Views;

namespace MeroHisab.ViewModels
{
    public class ReportByAccountHeadPageModel : ViewModelBase
    {
        public IAsyncCommand ExportButtonClicked { get; set; }

        private readonly IReportService _reportService;
        private readonly INotificationService _notificationService;

        public ReportByAccountHeadPageModel(IReportService reportService, INotificationService notificationService)
        {
            _reportService = reportService;
            _notificationService = notificationService;
            TransactionDetails = new ObservableRangeCollection<ReportTransactionDetailDto>();
            FilterModel = new TransactionFilterViewModel();
            LoadTransactionDetail();

            ExportButtonClicked = new AsyncCommand(OnExportButtonClicked);
        }

        public string ErrorMessage
        {
            get => GetValue<string>();
            set=> SetValue(value);
        }
        public decimal OpeningBalance
        {
            get => GetValue<decimal>();
            set=> SetValue(value);
        }
        public decimal ClosingBalance
        {
            get => GetValue<decimal>();
            set=> SetValue(value);
        }
        public ObservableRangeCollection<ReportTransactionDetailDto> TransactionDetails
        {
            get => GetValue<ObservableRangeCollection<ReportTransactionDetailDto>>();
            set => SetValue(value);
        }

        public TransactionFilterViewModel FilterModel
        {
            get => GetValue<TransactionFilterViewModel>();
            set => SetValue(value);
        }

        public LayoutState TransactionDetailLoadingState
        {
            get => GetValue<LayoutState>();
            set
            {
                SetValue(value);
            }
        }

        private async Task LoadTransactionDetail()
        {
            try
            {
                if (!FilterModel.LedgerId.HasValue)
                {
                    TransactionDetailLoadingState = LayoutState.Error;
                    ErrorMessage = "Please select account head.";
                    return;
                }
                TransactionDetailLoadingState = LayoutState.Loading;
                TransactionDetails.Clear();
                var transactions = await _reportService.GetTransactionDetailsWithinForLedger(FilterModel.FromDate, FilterModel.ToDate, FilterModel.LedgerId.Value);

                OpeningBalance = transactions.OrderBy(a => a.TransactionDate).FirstOrDefault()?.Balance ?? 0;
                ClosingBalance = transactions.OrderBy(a => a.TransactionDate).LastOrDefault()?.Balance ?? 0;

                TransactionDetails.AddRange(transactions);
                TransactionDetailLoadingState = LayoutState.Success;
            }
            catch (Exception ex)
            {
                TransactionDetailLoadingState = LayoutState.Error;
            }
        }

        private async Task OnExportButtonClicked()
        {
            await _notificationService.ShowInfo("I am not dumb", "Your click is being heard of");
        }
    }
}
