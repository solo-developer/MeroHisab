using MeroHisab.Core.Dto;
using MeroHisab.Core.Dto.Report;
using MeroHisab.Core.Services.Interface;
using MeroHisab.Partial.ReportFilter;
using MeroHisab.ViewModels.DefaultAccountSetup;
using System;
using System.Threading.Tasks;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.CommunityToolkit.UI.Views;
using Xamarin.Forms;

namespace MeroHisab.ViewModels
{
    public class ReceiptsListPageModel : ViewModelBase
    {
        private readonly IReceiptService _receiptService;
        public IAsyncCommand FilterButtonClicked { get; set; }
        public ReceiptsListPageModel(IReceiptService receiptService)
        {
            _receiptService = receiptService;
            DateRangeFilter = new DateRangeFilterViewModel();
            Receipts = new ObservableRangeCollection<ReceiptDto>();
            FilterButtonClicked = new AsyncCommand(OnFilterButtonClicked);
            LoadReceipts();
        }

        public LayoutState LoadingState
        {
            get => GetValue<LayoutState>();
            set
            {
                SetValue(value);
            }
        }

        public DateRangeFilterViewModel DateRangeFilter
        {
            get => GetValue<DateRangeFilterViewModel>();
            set => SetValue(value);
        }

        public ObservableRangeCollection<ReceiptDto> Receipts
        {
            get => GetValue<ObservableRangeCollection<ReceiptDto>>();
            set => SetValue(value);
        }
        

        private async Task OnFilterButtonClicked()
        {
            await _navigationService.ShowModal(new DateRangeFilterPopupModal(DateRangeFilter));
            
            MessagingCenter.Subscribe<DateRangeFilterViewModel>(this, "DateRangeFilterPopupPage.ApplyFilterButtonPressed", OnApplyButtonClickedFromDateRangeFilterPopup);
        }

        private async void OnApplyButtonClickedFromDateRangeFilterPopup(DateRangeFilterViewModel obj)
        {
            MessagingCenter.Unsubscribe<TransactionFilterViewModel>(this, "DateRangeFilterPopupPage.ApplyFilterButtonPressed");
            this.DateRangeFilter = obj;
            await LoadReceipts();
        }

        private async Task LoadReceipts()
        {
            try
            {
                LoadingState = LayoutState.Loading;

                var receipts = await _receiptService.Get(DateRangeFilter.FromDate, DateRangeFilter.ToDate);
                Receipts.Clear();
                Receipts.AddRange(receipts);
                LoadingState = LayoutState.Success;
                
            }
            catch (Exception)
            {
                LoadingState = LayoutState.Error;
                _toastService.LongAlert("Failed to load receipts.");
            }
        }
    }
}
