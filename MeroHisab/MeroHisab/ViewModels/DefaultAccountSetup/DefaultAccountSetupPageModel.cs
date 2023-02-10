using MeroHisab.Core.Dto;
using MeroHisab.Core.Enums;
using MeroHisab.Core.Extensions;
using MeroHisab.Core.Services.Interface;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xamarin.CommunityToolkit.ObjectModel;

namespace MeroHisab.ViewModels
{
    public class DefaultAccountSetupPageModel : ViewModelBase
    {
        private readonly ILedgerSetupService _ledgerSetupService;
        public DefaultAccountSetupPageModel(ILedgerSetupService ledgerSetupService)
        {
            _ledgerSetupService = ledgerSetupService;
            AccountKeys = new ObservableRangeCollection<string>();
            Setups = new ObservableRangeCollection<LedgerSetupDto>();
            SetAccountKeys();
            LoadSetups();
        }

        public ObservableRangeCollection<string> AccountKeys
        {
            get => GetValue<ObservableRangeCollection<string>>();
            set
            {
                SetValue(value);
            }
        }
        public ObservableRangeCollection<LedgerSetupDto> Setups
        {
            get => GetValue<ObservableRangeCollection<LedgerSetupDto>>();
            set
            {
                SetValue(value);
            }
        }

        private async Task LoadSetups()
        {
            var setups = await _ledgerSetupService.GetAllAsync();
            Setups.Clear();
            Setups.AddRange(setups);
        }
        private void SetAccountKeys()
        {
            var keys = Enum.GetValues(typeof(LedgerSetupType))
                .Cast<LedgerSetupType>()
      .Select(s => s.GetDisplayName()).OrderBy(a => a)
      .ToList();

            AccountKeys.Clear();
            AccountKeys.AddRange(keys);
        }
    }
}
