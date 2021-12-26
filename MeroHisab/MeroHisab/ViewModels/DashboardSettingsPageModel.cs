using MeroHisab.Core.Dto;
using MeroHisab.Core.Services.Interface;
using MeroHisab.Helpers.Interface;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.CommunityToolkit.UI.Views;

namespace MeroHisab.ViewModels
{
    public class DashboardSettingsPageModel : ViewModelBase
    {
        private readonly IAccountHeadService _accountHeadService;
        private readonly INotificationService _notificationService;

        public DashboardSettingsPageModel(IAccountHeadService accountHeadService, INotificationService notificationService)
        {
            _accountHeadService = accountHeadService;
            AccountHeads = new ObservableRangeCollection<AccountHeadDto>();
            PaymentMediums = new ObservableRangeCollection<PaymentMediumDto>();
            _notificationService = notificationService;
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
        private async Task LoadAccountHeads()
        {
            try
            {
                AccountHeadDataState = LayoutState.Loading;
                AccountHeads.Clear();
                var heads = await _accountHeadService.GetAccountHeads(Core.Enums.LedgerType.Normal, 3);
                AccountHeads.AddRange(heads);
                AccountHeads.AddRange(new List<AccountHeadDto>()
                {
                    new AccountHeadDto{Name="Salary",Id=1,HeadType=Core.Enums.PayHeadType.Income},
                    new AccountHeadDto{Name="Rent",Id=2,HeadType=Core.Enums.PayHeadType.Expense},
                    new AccountHeadDto{Name="Rojin",Id=2,HeadType=Core.Enums.PayHeadType.Liability},

                });
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
            // var heads = await _accountHeadService.GetAccountHeads(Core.Enums.LedgerType.PaymentMedium, 3);

            PaymentMediums.AddRange(new List<PaymentMediumDto>()
                {
                    new PaymentMediumDto{Name="Sanima Bank",Id=1,Code="SNB_BNK",Balance=250M},
                    new PaymentMediumDto{Name="Siddhartha Bank",Id=2,Code="SIDD_BNK",Balance=1156M},
                    new PaymentMediumDto{Name="Cash",Id=3,Code="CASH",Balance=0M},

                });
            PaymentMediumDataState = LayoutState.Success;
        }
    }
}
