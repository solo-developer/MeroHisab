using MeroHisab.Core.Dto;
using MeroHisab.Core.Services.Interface;
using System.Threading.Tasks;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.CommunityToolkit.UI.Views;

namespace MeroHisab.ViewModels
{
    public class DashboardSettingsPageModel : ViewModelBase
    {
        private readonly IAccountHeadService _accountHeadService;

        public DashboardSettingsPageModel(IAccountHeadService accountHeadService)
        {
            _accountHeadService = accountHeadService;
            AccountHeads = new ObservableRangeCollection<AccountHeadDto>();
        }

        public LayoutState AccountHeadDataState
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

        public async Task InitSettingsPageLoad()
        {
            try
            {
                AccountHeadDataState = LayoutState.Loading;
                AccountHeads.Clear();
                var heads =await _accountHeadService.GetAccountHeads();
                AccountHeads.AddRange(heads);
                AccountHeadDataState = LayoutState.Success;
            }
            catch (System.Exception ex)
            {
                AccountHeadDataState = LayoutState.Error;
            }
        }
    }
}
