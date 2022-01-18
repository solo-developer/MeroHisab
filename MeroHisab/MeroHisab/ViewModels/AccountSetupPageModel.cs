using MeroHisab.Core.Services.Interface;

namespace MeroHisab.ViewModels
{
    public class AccountSetupPageModel :ViewModelBase
    {
        private readonly ILedgerSetupService _ledgerSetupService;
        public AccountSetupPageModel(ILedgerSetupService ledgerSetupService)
        {
            _ledgerSetupService=ledgerSetupService;
        }
    }
}
