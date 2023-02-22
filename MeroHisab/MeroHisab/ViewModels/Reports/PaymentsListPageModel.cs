using MeroHisab.Core.Dto.Report;
using MeroHisab.Core.Services.Interface;
using MeroHisab.Partial.ReportFilter;
using MeroHisab.ViewModels.DefaultAccountSetup;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.CommunityToolkit.UI.Views;
using Xamarin.Forms;

namespace MeroHisab.ViewModels
{
    public class PaymentsListPageModel : ViewModelBase
    {
        private readonly IPaymentService _paymentService;
        public IAsyncCommand FilterButtonClicked { get; set; }
        public PaymentsListPageModel(IPaymentService receiptService)
        {
            _paymentService = receiptService;
            DateRangeFilter = new DateRangeFilterViewModel();
            Payments = new ObservableRangeCollection<PaymentDto>();
            FilterButtonClicked = new AsyncCommand(OnFilterButtonClicked);
            LoadPayments();
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

        public ObservableRangeCollection<PaymentDto> Payments
        {
            get => GetValue<ObservableRangeCollection<PaymentDto>>();
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
            await LoadPayments();
        }

        private async Task LoadPayments()
        {
            try
            {
                LoadingState = LayoutState.Loading;

                var payments = await _paymentService.Get(DateRangeFilter.FromDate, DateRangeFilter.ToDate);
                Payments.Clear();
                Payments.AddRange(payments);
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
