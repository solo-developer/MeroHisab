using MeroHisab.Core.Dto;
using MeroHisab.Core.Dto.Report;
using MeroHisab.Core.Entities;
using MeroHisab.Core.Services.Interface;
using MeroHisab.Helpers.Interface;
using MeroHisab.Partial.ReportFilter;
using MeroHisab.ViewModels.DefaultAccountSetup;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.CommunityToolkit.UI.Views;
using Xamarin.Forms;

namespace MeroHisab.ViewModels
{
    public class ReportByAccountHeadPageModel : ViewModelBase
    {
        public IAsyncCommand ExportButtonClicked { get; set; }
        public IAsyncCommand ApplyFilterButtonClicked { get; set; }
        public IAsyncCommand FilterButtonClicked { get; set; }

        private readonly IReportService _reportService;
        private readonly INotificationService _notificationService;
        private readonly ILedgerService _ledgerService;

        public ReportByAccountHeadPageModel(IReportService reportService, INotificationService notificationService, ILedgerService ledgerService)
        {
            _reportService = reportService;
            _notificationService = notificationService;
            _ledgerService = ledgerService;
            TransactionDetails = new ObservableRangeCollection<ReportTransactionDetailDto>();
            Ledgers = new ObservableRangeCollection<LedgerDto>();
            FilterModel = new TransactionFilterViewModel();
            LoadTransactionDetail();
            LoadLedgers();

            ExportButtonClicked = new AsyncCommand(OnExportButtonClicked);
            ApplyFilterButtonClicked = new AsyncCommand(OnApplyFilterButtonClicked);
            FilterButtonClicked = new AsyncCommand(OnFilterButtonClicked);

        }

        private async Task OnFilterButtonClicked()
        {
            await _navigationService.ShowModal(new TransactionFilterPopupModal(FilterModel));
            MessagingCenter.Subscribe<TransactionFilterViewModel>(this, "TransactionFilterPopuPage.ApplyFilterButtonPressed", OnApplyButtonClickedFromTransactionFilterPopup);
        }

        private async void OnApplyButtonClickedFromTransactionFilterPopup(TransactionFilterViewModel obj)
        {
            MessagingCenter.Unsubscribe<TransactionFilterViewModel>(this, "TransactionFilterPopuPage.ApplyFilterButtonPressed");
            this.FilterModel = obj;
            await LoadTransactionDetail();
        }

        private async Task OnApplyFilterButtonClicked()
        {
            try
            {
                FilterModel.LedgerId = null;
                if (SelectedLedger != null)
                {
                    FilterModel.LedgerId = SelectedLedger.LedgerId;
                }
                await LoadTransactionDetail();
            }
            catch (Exception ex)
            {
                await _notificationService.ShowInfo("Error!!", "Failed to load transaction detail.");
            }
        }

        public string ErrorMessage
        {
            get => GetValue<string>();
            set => SetValue(value);
        }
        public decimal OpeningBalance
        {
            get => GetValue<decimal>();
            set => SetValue(value);
        }
        public decimal ClosingBalance
        {
            get => GetValue<decimal>();
            set => SetValue(value);
        }
        public LedgerDto SelectedLedger
        {
            get => GetValue<LedgerDto>();
            set => SetValue(value);
        }
        public ObservableRangeCollection<ReportTransactionDetailDto> TransactionDetails
        {
            get => GetValue<ObservableRangeCollection<ReportTransactionDetailDto>>();
            set => SetValue(value);
        }

        public ObservableRangeCollection<LedgerDto> Ledgers
        {
            get => GetValue<ObservableRangeCollection<LedgerDto>>();
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
        private async Task LoadLedgers()
        {
            try
            {
                var ledgers = await _ledgerService.GetAllLedgersAsync();
                Ledgers.Clear();
                Ledgers.AddRange(ledgers);
            }
            catch (Exception)
            {
                await _notificationService.ShowInfo("Error!!", "Failed to load account heads");
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
                TransactionDetails=new ObservableRangeCollection<ReportTransactionDetailDto>();
                var transactions = await _reportService.GetTransactionDetailsWithinForLedger(FilterModel.FromDate, FilterModel.ToDate, FilterModel.LedgerId.Value);

                OpeningBalance = transactions.OrderBy(a => a.TransactionDate).FirstOrDefault()?.Balance ?? 0;
                ClosingBalance = transactions.OrderBy(a => a.TransactionDate).LastOrDefault()?.Balance ?? 0;

                TransactionDetails.AddRange(transactions);
                TransactionDetailLoadingState = LayoutState.Success;
            }
            catch (Exception ex)
            {
                ErrorMessage = "Failed to get transaction detail of specified ledger";
                TransactionDetailLoadingState = LayoutState.Error;
            }
        }

        private async Task OnExportButtonClicked()
        {
            await _notificationService.ShowInfo("I am not dumb", "Your click is being heard of");
        }
    }
}
