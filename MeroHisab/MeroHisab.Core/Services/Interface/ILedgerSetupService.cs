using MeroHisab.Core.Entities;

namespace MeroHisab.Core.Services.Interface
{
    public interface ILedgerSetupService
    {
        void saveOrUpdate(string key, string value);
        void saveOrUpdate(List<LedgerSetup> keyValue);

    }

}
