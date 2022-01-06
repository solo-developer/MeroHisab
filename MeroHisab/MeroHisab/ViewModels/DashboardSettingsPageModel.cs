using MeroHisab.Core.Dto;
using MeroHisab.Core.Services.Interface;
using MeroHisab.Helpers.Interface;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.CommunityToolkit.UI.Views;

namespace MeroHisab.ViewModels
{
    public class DashboardSettingsPageModel : ViewModelBase
    {
        private readonly IAccountHeadService _accountHeadService;
        private readonly INotificationService _notificationService;

        public IAsyncCommand ViewAllAccountHeadCommand;
        public DashboardSettingsPageModel(IAccountHeadService accountHeadService, INotificationService notificationService)
        {
            _accountHeadService = accountHeadService;
            AccountHeads = new ObservableRangeCollection<AccountHeadDto>();
            PaymentMediums = new ObservableRangeCollection<PaymentMediumDto>();
            _notificationService = notificationService;
            ViewAllAccountHeadCommand = new AsyncCommand(() => NavigateToAccountHeadListPage(), a => true);
        }

        public LayoutState AccountHeadDataState
        {
            get => GetValue<LayoutState>();
            set
            {
                SetValue(value);
            }
        }
        public LayoutState PaymentMediumDataState
        {
            get => GetValue<LayoutState>();
            set
            {
                SetValue(value);
            }
        }

        public ObservableRangeCollection<AccountHeadDto> AccountHeads
        {
            get => GetValue<ObservableRangeCollection<AccountHeadDto>>();
            set
            {
                SetValue(value);
            }
        }

        public AccountHeadDto SelectedAccountHead
        {
            get => GetValue<AccountHeadDto>();
            set
            {
                SetValue(value);
            }
        }
        public ObservableRangeCollection<PaymentMediumDto> PaymentMediums
        {
            get => GetValue<ObservableRangeCollection<PaymentMediumDto>>();
            set
            {
                SetValue(value);
            }
        }

        public PaymentMediumDto SelectedPaymentMedium
        {
            get => GetValue<PaymentMediumDto>();
            set
            {
                SetValue(value);
            }
        }

        public async Task InitSettingsPageLoad()
        {
            try
            {
                LoadAccountHeads();
                LoadPaymentMediums();
            }
            catch (System.Exception ex)
            {
                await _notificationService.ShowInfo("Error", "Failed to perform the operation.");
            }
        }

        public async Task NavigateToAccountHeadListPage()
        {
            await _navigationService.NavigateToAsync<AccountHeadListPageModel>();
        } 
        
        public async Task NavigateToPaymentMediumListPage()
        {
            await _navigationService.NavigateToAsync<PaymentMediumListPageModel>();
        }
        private async Task LoadAccountHeads()
        {
            try
            {
                AccountHeadDataState = LayoutState.Loading;
                AccountHeads.Clear();
                var heads = await _accountHeadService.GetAccountHeads(Core.Enums.LedgerType.Normal, 3);
                AccountHeads.AddRange(heads);
                AccountHeadDataState = LayoutState.Success;
            }
            catch (System.Exception)
            {
                AccountHeadDataState = LayoutState.Error;
            }

        }
        private async Task LoadPaymentMediums()
        {
            PaymentMediumDataState = LayoutState.Loading;
            PaymentMediums.Clear();
            var heads = await _accountHeadService.GetAccountHeads(Core.Enums.LedgerType.PaymentMedium, 3);
            PaymentMediums.AddRange(heads.Select(a => new PaymentMediumDto
            {
                Id = a.Id,
                Name = a.Name,
                Code = a.Code,
                Balance = 0
            }).ToList());
            PaymentMediumDataState = LayoutState.Success;
        }
    }
}
