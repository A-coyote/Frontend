import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';

const ConfirmDeleteDialog = ({ open, onClose, onConfirm }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="confirm-delete-dialog"
            aria-describedby="confirm-delete-dialog-description"
        >
            <DialogTitle id="confirm-delete-dialog">¿Estás seguro de que quieres eliminar este registro?</DialogTitle>
            <DialogContent>
                <p>Esta acción no se puede deshacer.</p>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancelar
                </Button>
                <Button
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                    color="secondary"
                    autoFocus
                >
                    Eliminar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDeleteDialog;


